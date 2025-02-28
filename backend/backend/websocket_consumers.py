import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.send(text_data=json.dumps({"message": "WebSocket connected"}))

    async def disconnect(self, close_code):
        print(f"WebSocket disconnected: {close_code}")

    async def receive(self, text_data):
        data = json.loads(text_data)
        print(f"Received: {data}")

        # Simulate a server response
        await self.send(text_data=json.dumps({"message": "pong"}))
