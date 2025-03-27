import asyncio
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .game import PongGame
from .game_manager import game_manager
from copy import deepcopy

class PongConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.message_handlers = {
            "update": self.handle_update,
            "game_active": self.handle_game_active,
        }

    async def connect(self):
        self.player_id = self.scope["client"][1]  # Unique ID for each player
        self.game_id = game_manager.add_player_to_game(self.player_id)
        self.game = PongGame()
        await self.accept()
        await self.send(json.dumps({"message": "Connected", "game_id": self.game_id}))
    
        self.game_task = asyncio.create_task(self.game_loop())  

    async def disconnect(self, close_code):
        game_manager.remove_player(self.player_id)
        print(f"CLIENT[{self.player_id}] game-id[{self.game_id}]:Disconnected")
        if hasattr(self, 'game_task') and not self.game_task.done():
            self.game_task.cancel()
        await self.close()

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type")

        # Route the message to the appropriate handler
        if message_type in self.message_handlers:
            await self.message_handlers[message_type](data)
        else:
            print(f"Unknown message type: {message_type}")

    async def handle_update(self, data):
        update = data.get("data", {})
        if "left" in update:
            self.game.move_players("left", update["left"])
            await self.send(json.dumps({"players": {"left": self.game.players["left"]}}))
        if "right" in update:
            self.game.move_players("right", update["right"])
            await self.send(json.dumps({"players": {"right": self.game.players["right"]}}))

    async def handle_game_active(self, data):
        print("set game_active to ", data.get("game_active", False) )
        self.game.game_active = data.get("game_active", False)


    async def sendResponse(self, message):
        await self.send(json.dumps(message))

    async def game_loop(self):

        print(f"[{self.game_id}] - LOOP STARTED - ", self.game.game_active)
        
        while self.game.game_active:
            self.game.update_ball()
            self.game.endGame()
            await self.send(json.dumps({"ball":self.game.ball}))

            await self.send(json.dumps({"players": self.game.players}))
            await asyncio.sleep(0.01)  # 60ms delay for smooth updates
        print(f"[{self.game_id}] - LOOP ENDED - ", self.game.game_active)

