import asyncio
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .game import PongGame
from .game_manager import game_manager
from copy import deepcopy
from api.models import Match  # Importer le modèle Match pour récupérer le tournament_id
import logging

# Configurer le logger
logger = logging.getLogger(__name__)

# Importer la fonction pour envoyer les scores à la blockchain
from api.views import send_score_to_blockchain

class PongConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.message_handlers = {
            "init": self.handle_init,
            "update": self.handle_update,
            "game_active": self.handle_game_active,
        }
        self.tournament_id = None  # Stocker le tournament_id

    async def connect(self):
        self.player_id = str(self.scope["user"].id if self.scope["user"].is_authenticated else "anonymous")
        self.match_id = self.scope["url_route"]["kwargs"]["match_id"]
        self.game_id = game_manager.add_player_to_game(self.player_id, self.match_id)
        if self.game_id is None:
            await self.close(code=4000, reason="Game is full")
            return
        self.game = game_manager.get_game_instance(self.match_id)
        if not self.game:
            await self.close(code=4001, reason="Game instance not found")
            return

        # Récupérer le tournament_id à partir du match_id
        try:
            match = Match.objects.get(id=self.match_id)
            self.tournament_id = match.tournament_id.id if match.tournament_id else None
        except Match.DoesNotExist:
            logger.error(f"Match with id {self.match_id} not found")
            await self.close(code=4003, reason="Match not found")
            return

        self.game_mode = game_manager.get_game_mode(self.match_id)
        self.game.game_active = False  # Désactiver le jeu par défaut

        await self.accept()
        # Envoyer l'état initial du jeu
        await self.send(json.dumps({
            "message": "Connected",
            "game_id": self.game_id,
            "players": game_manager.games.get(self.match_id, []),
            "game_state": {
                "pelota": self.game.pelota,
                "jugadores": self.game.jugadores,
                "game_active": self.game.game_active
            }
        }))

    async def disconnect(self, close_code):
        game_manager.remove_player(self.player_id, self.match_id)
        print(f"CLIENT[{self.player_id}] game-id[{self.game_id}]:Disconnected")
        if hasattr(self, 'game_task') and not self.game_task.done():
            self.game_task.cancel()

        # Stocker les scores dans la blockchain si le jeu est terminé
        if self.game and not self.game.game_active:
            players = game_manager.games.get(self.match_id, [])
            player1_id = players[0] if len(players) > 0 else "0"
            player2_id = players[1] if len(players) > 1 else "0"
            score_left = self.game.jugadores["izq"]["score"]
            score_right = self.game.jugadores["der"]["score"]
            
            # Mettre à jour les scores dans la base de données
            try:
                match = Match.objects.get(id=self.match_id)
                match.left_score = score_left
                match.right_score = score_right
                match.save()
                logger.info(f"Match {self.match_id} scores updated in database: {score_left} - {score_right}")
            except Match.DoesNotExist:
                logger.error(f"Match with id {self.match_id} not found when updating scores")

            # Envoyer les scores à la blockchain si un tournament_id est disponible
            if self.tournament_id:
                try:
                    send_score_to_blockchain(self.tournament_id, score_left, score_right)
                    logger.info(f"Scores stored in blockchain for tournament {self.tournament_id}: {score_left} - {score_right}")
                except Exception as e:
                    logger.error(f"Error storing scores in blockchain for tournament {self.tournament_id}: {str(e)}")
            else:
                logger.warning(f"No tournament_id found for match {self.match_id}. Scores not stored in blockchain.")

        await self.close()

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type")

        if message_type in self.message_handlers:
            await self.message_handlers[message_type](data)
        else:
            print(f"Unknown message type: {message_type}")

    async def handle_init(self, data):
        game_mode = data.get("game_mode", "remote")
        game_manager.add_player_to_game(self.player_id, self.match_id, game_mode)
        self.game_mode = game_manager.get_game_mode(self.match_id)

        # Vérifier le nombre de joueurs connectés
        players = game_manager.games.get(self.match_id, [])
        if self.game_mode == "local":
            self.game.game_active = True  # Démarrer immédiatement en mode local
        elif self.game_mode == "remote" and len(players) == 2:
            self.game.game_active = True  # Démarrer en mode remote si 2 joueurs

        # Envoyer l'état mis à jour
        await self.send(json.dumps({
            "message": "Game mode set",
            "game_mode": self.game_mode,
            "players": players,
            "game_state": {
                "pelota": self.game.pelota,
                "jugadores": self.game.jugadores,
                "game_active": self.game.game_active
            }
        }))

        if self.game.game_active and not hasattr(self, 'game_task'):
            self.game_task = asyncio.create_task(self.game_loop())

    async def handle_update(self, data):
        update = data.get("data", {})
        if "izq" in update:
            self.game.mover_jugadores("izq", update["izq"])
            await self.send(json.dumps({"jugadores": {"izq": self.game.jugadores["izq"]}}))
        if "der" in update:
            self.game.mover_jugadores("der", update["der"])
            await self.send(json.dumps({"jugadores": {"der": self.game.jugadores["der"]}}))

    async def handle_game_active(self, data):
        print("set game_active to ", data.get("game_active", False))
        self.game.game_active = data.get("game_active", False)

    async def sendResponse(self, message):
        await self.send(json.dumps(message))

    async def game_loop(self):
        print(f"[{self.game_id}] - LOOP STARTED - ", self.game.game_active)
        
        while self.game.game_active:
            try:
                self.game.update_pelota()
                await self.send(json.dumps({
                    "pelota": self.game.pelota,
                    "jugadores": self.game.jugadores,
                    "game_active": self.game.game_active
                }))
                await asyncio.sleep(0.06)
            except Exception as e:
                print(f"Error in game loop: {e}")
                break
        print(f"[{self.game_id}] - LOOP ENDED - ", self.game.game_active)
