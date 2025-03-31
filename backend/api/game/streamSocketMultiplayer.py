import json
import uuid
import asyncio
import logging
from django.http import JsonResponse
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from channels.db import database_sync_to_async
from api.models import Match
from .pongame import PongGame
from .asyncDb import get_match

# from .game_manager import game_manager  # Import game session manager
logger = logging.getLogger("django")


    # Loop de interacion con el cliente, servidor = StreamSocketMultiplayer

#1 cliente crea partido POST con match player 1  = userId en body
#2 cliente ejecuta ws.connect() -> sservidor recibe en ervidor.connect()
#3 cliente ws.send({'match-id':Id}) servidor reciben en servidor.__handle_MatchSessionPairing()
    # 3.1 se anade player 2 al MatchId en db
     #3.2 anadir al canal al grupo de canales
#

# Function that handles incoming new connections for online matches
class StreamSocketMultiplayer(AsyncWebsocketConsumer):
#   await self.channel_layer.group_add(self.match_id, self.channel_name)
#   await self.channel_layer.group_send(self.match_id, {"type": "game_update", "players": game.players})
#   await self.channel_layer.group_discard(self.match_id, self.channel_name)
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.__message_handlers = {
            "update": self.__handle_update,
            "game_active": self.__handle_game_active}

    async def connect(self):
        self.player_id = self.scope["user"]
        logger.info("Player id connected to WS: {self.player_id}")
        # logger.info("Match id Game: {self.match_id}")
        logger.info({self.scope})

        await self.accept()
        await self.send(json.dumps({"message": "Connected"}))
        #self.game_task= await asyncio.create_task(self.game_loop())  

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.match_id, self.channel_name)
        await self.close()

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type")

        # Route the message to the appropriate handler
        if message_type in self.message_handlers:
            await self.__message_handlers[message_type](data)
        else:
            print(f"Unknown message type: {message_type}")

    async def __handle_MatchSessionPairing(self, data):
        """Associate socket session with a match-id"""
        match_id = data.get('matchId', '')

        if (get_match(self.match_id))
            logger.info("Match not found")
            return JsonResponse({"error": "Match not found"}, status=404)
    
        await self.channel_layer.group_add(match_id, self.channel_name)
        #AsyncioGame.loop() routine

    # async def __handle_notifyInvite(self):

    async def __handle_update(self, data):
        """Processes paddle movement updates"""
        if not hasattr(self, 'game'):
            logger.info("handleGameUpdateWs: Game not found")
            return
        update = data.get("data", {})
        direction = ("left", "right")

        if direction[0] in update:
            self.game.move_players("left", update["left"])
            direction = direction[0]
    
        else direction[1] in update:
            self.game.move_players("right", update["right"])
            direction = direction[1]
        await self.channel_layer.group_send(self.match_id, {"type": "game_update", {"players": {direction: self.game.players[direction]}}})

    async def __handle_game_active(self, data):
        self.game.game_active = data.get("game_active", False)

    async def __sendResponse(self, message):
        await self.send(json.dumps(message))

    async def __game_loop(self):
        print(f"[{self.game_id}] - LOOP STARTED - ", self.game.game_active)
        
        while self.game.game_active:
            self.game.update_ball()
            self.game.endGame()
            await self.send(json.dumps({"ball":self.game.ball}))
            await self.send(json.dumps({"players": self.game.players}))
            await asyncio.sleep(0.01)  # 60ms delay for smooth updates
        print(f"[{self.game_id}] - LOOP ENDED - ", self.game.game_active)



# class StreamSocketMultiplayerGame(AsyncWebsocketConsumer):
#     async def connect(self, match): 
#         """Handles new WebSocket connections"""
#         self.player_id = self.scope['user']
#         print(self.player_id)
#         logger.info(self.player_id)
#         # self.player_id = self.scope['user']['id']
#         # self.match_id = self.scope['url_route']	['match_id']


#         # encantrar en los modelos el match a traves del match_id
#         # comprobar que falta un jugador o rechazar
#         # si hay modelo unirse al grupo
#         #SINO
#         # anadir channel grupo con el match_id de la request 
#         # iniciar partida con player 1 username
#         # invokar asyncio loop
#         # esperar

#         # # Add player to group (match room)
#         # await self.channel_layer.group_add(self.match_id, self.channel_name)

#         # # Ensure the game exists
#         # game_manager.create_game(self.match_id)

#         await self.accept()
#         await self.send(json.dumps({"message": "Connected", "player_id": self.player_id}))

#     async def disconnect(self, close_code):
#         """Removes player from the group on disconnect"""
#         await self.channel_layer.group_discard(self.match_id, self.channel_name)
#         print(f"Player {self.player_id} disconnected from match {self.match_id}")

#     async def receive(self, text_data):
#         """Handles incoming messages from players"""
#         data = json.loads(text_data)
#         message_type = data.get("type")

#         if message_type == "update":
#             await self.handle_update(data)
#         elif message_type == "game_active":
#             await self.handle_game_active(data)
#         elif message_type =="matchId":
#             await self.handle_MatchSessionPairing(data)
#         else:
#             print(f"Unknown message type: {message_type}")

#     async def handle_MatchSessionPairing(self):
#         """Associate socket session with a match-id"""
        
        

#     async def handle_update(self, data):
#         """Processes paddle movement updates"""
#         update = data.get("data", {})
#         game = game_manager.get_game(self.match_id)
#         if not game:
#             return

#         if "left" in update:
#             game.players["left"] = update["left"]
#         if "right" in update:
#             game.players["right"] = update["right"]

#         await self.channel_layer.group_send(
#             self.match_id, 
#             {"type": "game_update", "players": game.players}
#         )

#     async def handle_game_active(self, data):
#         """Starts or stops the game"""
#         game = game_manager.get_game(self.match_id)
#         if game:
#             game.game_active = data.get("game_active", False)

#     async def game_update(self, event):
#         """Sends game updates to all players"""
#         await self.send(json.dumps(event))
