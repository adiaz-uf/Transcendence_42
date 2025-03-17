import asyncio
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .game import PongGame
from .game_manager import game_manager
from copy import deepcopy

class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.player_id = self.scope["client"][1]  # Unique ID for each player
        self.game_id = game_manager.add_player_to_game(self.player_id)
        self.game = PongGame()
        await self.accept()
        await self.send(json.dumps({"message": "Connected", "game_id": self.game_id}))
    
        asyncio.create_task(self.game_loop())

    async def disconnect(self, close_code):
        game_manager.remove_player(self.player_id)
        await self.close()

    async def receive(self, text_data):
        data = json.loads(text_data)
        print("Received from client:", data)
        # id in data['userId']
        if "izq" in data.get('update', {}):
            self.game.mover_jugadores("izq", data["update"]['izq'])
            await self.send(json.dumps(
                {"jugadores": {'izq':self.game.jugadores['izq']}}))
            
        if "der" in data.get('update', {}):
            self.game.mover_jugadores("der", data["update"]['der'])   
            await self.send(json.dumps(
                {"jugadores": {'der':self.game.jugadores['der']}}))
 
              
        # if "move" in data:
        #     game_manager.update_paddle(self.game_id, self.player_id, data["move"])

    #async def parse_action(self, client_message):
        
        
    async def sendResponse(self, message):
        await self.send(json.dumps(message))

    async def game_loop(self):
        while self.game.game_active:
        
            self.game.update_pelota()

            await self.send(json.dumps({"pelota":self.game.pelota}))

            await asyncio.sleep(0.06)  # 60ms delay for smooth updates
