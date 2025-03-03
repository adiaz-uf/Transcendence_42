import asyncio
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .game_manager import game_manager
from .game import PongGame

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
        if "move" in data:
            game_manager.update_paddle(self.game_id, self.player_id, data["move"])

    async def game_loop(self):
        self.previous_state = None

        while True:
            if self.game.game_active:
                self.game.update()
            else:
                await asyncio.sleep(1)  # Wait 1 second before restarting
                self.game.start_game()

            current_state = deepcopy({
                "ball": self.game.ball,
                "paddles": self.game.paddles,
                "scores": self.game.scores
            })

            if current_state != self.previous_state:
                await self.send(json.dumps({
                    "type": "gameUpdate",
                    "ball": self.game.ball,
                    "paddles": self.game.paddles,
                    "scores": self.game.scores
                }))
                self.previous_state = current_state

            await asyncio.sleep(0.06)  # 60ms delay for smooth updates
