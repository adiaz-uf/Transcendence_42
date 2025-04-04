import json
import uuid
import asyncio
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from .asyncDb import IsPlayerinMatch, IsMultiplayerMatch
from .GameSessionManager import GameSessionManager


# from .game_manager import game_manager  # Import game session manager
logger = logging.getLogger("django")


    # Loop de interacion con el cliente, servidor = StreamSocketMultiplayer

#1 cliente1 ejecuta ws.connect()
#1.1 cliente1 crea partido POST con posible player_2 para local 2p 
    #1.1 O sino deja player2 vacio y client2 hace post al partido de client1 poniendose como player2 

#2 cliente ws.send({'match-id':Id}) servidor reciben en servidor.__handle_MatchSessionPairing()

#3. cliente ws.send({'game_active':Id}) servidor reciben en servidor.__handle_game_active()


session_manager = GameSessionManager() #Store active connections and games


# Function that handles incoming new connections for matches
class StreamSocket(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.matchId = None
        self.player_1 = None
        self.__message_handlers = {
            'connectToMatch': self.__handle_MatchSessionPairing,
            "update": self.__handle_update,
            "game_active": self.__handle_game_active}

    async def connect(self):
        # logger.info(f"WS SCOPE: %s", json.dumps(self.scope, default=str, indent=4))
        self.player_1 = self.scope["user"] # Unique ID for each player from User model since auth is used
        logger.info("WS connectfrom: %s", self.player_1)
        await self.accept()
        await self.send(json.dumps({"message": "Connected"}))

    async def disconnect(self, close_code):
        logger.info("WS DISCONNECT: %s   %d", self.player_1, close_code)
        #Cancel GameTask
        session = session_manager.getSession(self.matchId)
        if session:
            session_manager.getGameTask(self.matchId).cancel()
            await self.channel_layer.group_discard(self.matchId, self.channel_name)
        await self.close()

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type", None)

        # Route the message to the appropriate handler
        if message_type in self.__message_handlers:
            await self.__message_handlers[message_type](data)
        else:
            print(f"Unknown message: {data}")

    async def __handle_MatchSessionPairing(self, data):
        """Confirm socket session with a match"""
        logger.info(data)
        match_id = data.get('matchId', None)

        if  match_id is None:
            await self.send(json.dumps({"Error": "No matchId"}))
            return

        self.matchId = match_id

        try:
            Ismultiplayermatch = IsMultiplayerMatch(self.matchId)
        except ObjectDoesNotExist:
            await self.send(json.dumps({"Error": "Match not found"}))
            return
        
        # Check if the player is in the match and returns which user is opening conection
        which_player = IsPlayerinMatch(self.matchId, self.player_1)

        if not Ismultiplayermatch and which_player == 1:
            await self.channel_layer.group_add(self.matchId, self.channel_name)
            session_manager.create_session(self.matchId, self.user_id, self.channel_name)
            gameTask = await asyncio.create_task(self.game_loop())
            session_manager.setGameTask(self.matchId, gameTask)
        else:
            if which_player == 1:
                await self.channel_layer.group_add(self.matchId, self.channel_name)
                session_manager.create_session(self.matchId, self.user_id, self.channel_name)
                gameTask = await asyncio.create_task(self.game_loop())
                session_manager.setGameTask(self.matchId, gameTask)
                logger.info(f"WS Player 1: {self.player_1}")

            elif which_player == 2:
                await self.channel_layer.group_add(self.matchId, self.channel_name)
                session_manager.join_session(self.matchId, self.user_id, self.channel_name)
                logger.info(f"WS Player 2: {self.player_1}")
            else:
                await self.send(json.dumps({"Error": "Not in Match"}))

                return
        logger.info("WS Match- JOINED")
        await self.send(json.dumps({"joined": True}))


    async def __handle_update(self, data):
        """Processes paddle movement updates"""
        if self.matchId:
            logger.info("handleGameUpdateWs: Game not found")
            return

        direction = data.get("direction", {})
        userId = data.get("userId", {})

        gameobject = session_manager.getGameObject(self.matchId)
        if not gameobject:
            logger.info("handleGameUpdateWs: Game not found")
            return
        if session_manager.getSession(self.matchId)['player1'] == userId:
            gameobject.move_players('left', direction)
            await self.channel_layer.group_send(self.matchId, {"type": "game_update", 'left': gameobject.get_players('left')})

        elif session_manager.getSession(self.matchId)['player2'] == userId:
            gameobject.move_players('right', direction)
            await self.channel_layer.group_send(self.matchId, {"type": "game_update", 'right': gameobject.get_players('right')})

    async def __handle_game_active(self, data):
        gameobject = session_manager.getGameObject(self.matchId)
        gameobject.SetGameActive(data.get("game_active", False))

    async def __game_loop(self):
        print(f"[- LOOP STARTED - ", self.matchId)
        gameobject = session_manager.getGameObject(self.matchId)

        while 42:
            if gameobject.IsGameActive():
                self.game.update_ball()
                self.game.endGame()
                await self.channel_layer.group_send(self.matchId, {"type": "game_update", "players": self.game.players, "ball": self.game.ball})
                await asyncio.sleep(0.01)  # 60ms delay for smooth updates
    
        print("[- LOOP ENDED - ", self.matchId)
