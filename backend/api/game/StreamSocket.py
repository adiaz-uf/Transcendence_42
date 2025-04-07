import json
import uuid
import asyncio
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from .asyncDb import thread_IsMultiplayerMatch, thread_IsPlayerinMatchDB
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
        self.is_multiplayer = False
        self.which_player = 0 # 0 = not in match, 1 = player1, 2 = player2
        self.__message_handlers = {
            'connectToMatch': self.__handle_MatchSessionPairing,
            "update": None,
            "game_active": self.__handle_game_active
            }


    async def connect(self):
        #logger.info(f"WS SCOPE: %s", json.dumps(self.scope, default=str, indent=4))

        user = self.scope['user']
        await self.accept()
        logger.info(f"WS SCOPE AFTER: %s", json.dumps(self.scope, default=str, indent=4))

        self.player_1 = getattr(self.scope['user'], 'id', None)# Unique ID for each player from User model since auth is used
        logger.info("WS connectfrom: %s", self.player_1)
        await self.send(json.dumps({"message": "Connected"}))

    async def disconnect(self, close_code):
        logger.info("WS DISCONNECT: %s   %d", self.player_1, close_code)
        #Cancel GameTask
        session = await session_manager.getSession(self.matchId)
        if session:
            await session_manager.getGameTask(self.matchId).cancel()
        if self.is_multiplayer:
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
        """Confirm socket connection with a match" & session"""
        logger.info(data)
        match_id = data.get('matchId', None)
        if  match_id is None:
            await self.send(json.dumps({"Error": "No matchId"}))
            return
        print(f"WS Match ID: {match_id}")
        self.matchId = match_id
        
        # Check if the match is multiplayer
        self.is_multiplayer = await thread_IsMultiplayerMatch(self.matchId)

        self.__message_handlers['update'] = self.__handle_remote_updates if self.is_multiplayer else self.__handle_local_updates
    
        
        # Check if the player is in the match and returns which user is opening conection
        self.which_player = await thread_IsPlayerinMatchDB(self.matchId, self.player_1)

        if not self.is_multiplayer and self.which_player == 1:
            await session_manager.create_session(self.matchId, self.player_1, self.channel_name)
            self.gameobject = await session_manager.getGameObject(self.matchId)
            await self.gameobject.reset_game()
            gameTask = asyncio.create_task(self.__game_loop())
            await session_manager.setGameTask(self.matchId, gameTask)
        else:
            if self.which_player == 1:
                await self.channel_layer.group_add(self.matchId, self.channel_name)
                await session_manager.create_session(self.matchId, self.player_1, self.channel_name)
                self.gameobject = await session_manager.getGameObject(self.matchId)
                await self.gameobject.reset_game()
                gameTask = asyncio.create_task(self.__game_loop())
                await session_manager.setGameTask(self.matchId, gameTask)
                logger.info(f"WS Player 1: {self.player_1}")

            elif self.which_player == 2:
                await self.channel_layer.group_add(self.matchId, self.channel_name)
                await session_manager.join_session(self.matchId, self.player_1, self.channel_name)
                self.gameobject = await session_manager.getGameObject(self.matchId)
                await self.gameobject.reset_game()
                logger.info(f"WS Player 2: {self.player_1}")
            else:
                await self.send(json.dumps({"Error": "Not in Match"}))
                return
        logger.info("WS Match- JOINED")
        await self.send(json.dumps({"joined": True}))



    async def __handle_remote_updates(self, data):
        """Processes paddle movement updates"""
        if self.matchId or self.__message_handlers.get("update") is None:
            logger.info("handleGameUpdateWs: Game not found")
            return

        direction = data.get("direction", {})
        userId = data.get("userId", {})
        side = 'left'
        playerOneid = await session_manager.getSession(self.matchId)['player1']['id']
        playerTwoid = await session_manager.getSession(self.matchId)['player2']['id']
        if playerOneid == userId:
            await self.gameobject.move_players('left', direction)
        elif playerTwoid == userId:
            await self.gameobject.move_players('right', direction)
            side = 'right'
        await self.channel_layer.group_send(self.matchId, {"type": "game_update", side: gameobject.get_players(side)})


    async def __handle_local_updates(self, data):
        """Processes paddle movement updates for local matches"""

        if not self.matchId or self.__message_handlers.get("update") is None:
            logger.info("handleGameUpdateWs: Game not found")
            return
        direction = data.get("direction", {})
        right_or_left = data.get("player", {})

        player_side_update = await self.gameobject.move_players(right_or_left, direction)
        await self.send(json.dumps({"type": "game_update", "players":player_side_update['players']}))



    async def __handle_game_active(self, data):
        await self.gameobject.SetGameActive(data.get("game_active", False))
        logger.info("Game active: %s", await self.gameobject.get_GameActive())


    async def _send(self, message):
        """Sends a message directly and only to the WebSocket client"""
        await self.send(text_data=message)

    async def __send_updateGame(self, gamestate):
        """Sends game updates to all players or to the client"""
        print("sending update ",gamestate)
        if self.is_multiplayer:
            await self.channel_layer.group_send(self.matchId, {"type": "game_update", "players": gamestate["players"], "ball": gamestate["ball"], "game_active": gamestate["active"]})
        else:
            print("why")
            await self.send(json.dumps({"type": "game_update", "ball": gamestate["ball"]}))
        print("sended update")

    async def __game_loop(self):
        """Main game loop for the match using Pong instance of the session"""
        print(f"[- LOOP STARTED - ", self.matchId)
        while True:
            gameState = await self.gameobject.get_gameState()
            IsGameActive = await self.gameobject.get_GameActive()
            print(f"Game active: {IsGameActive}")
            if IsGameActive:

                update = await self.gameobject.update_ball(700, 900)
                # if side:
                #     await self.gameobject.ball_goal_collision(side)
                #     await self.gameobject.reset_ball(ball_update['ball'], side, 700, 900)

                IsEndOfGame = await self.gameobject.IsScoreReachedSoEndGame(update['scores'])
                print("Is end of game: ", IsEndOfGame)
                if (IsEndOfGame):
                    await self.gameobject.reset_game()
                    await self._send(json.dumps({"game_over": True}))
                    break
                print("sending update..")
                await self.__send_updateGame(update)
                await asyncio.sleep(0.4)  # 60ms delay for smooth updates
            else:
                await asyncio.sleep(1)
    
        print("[- LOOP ENDED - ", self.matchId)
