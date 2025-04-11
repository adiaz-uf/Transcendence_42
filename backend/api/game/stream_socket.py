import json
import uuid
import asyncio
import logging
import random
from channels.generic.websocket import AsyncWebsocketConsumer
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from .session_manager import session_manager
from .pongame import PongGame

logger = logging.getLogger(__name__)


    # Loop de interacion con el cliente, servidor = StreamSocketMultiplayer

#1 cliente1 ejecuta ws.connect()
#1.1 cliente1 crea partido POST con posible player_2 para local 2p 
    #1.1 O sino deja player2 vacio y client2 hace post al partido de client1 poniendose como player2 

#2 cliente ws.send({'match-id':Id}) servidor reciben en servidor.__handle_MatchSessionPairing()

#3. cliente ws.send({'game_active':Id}) servidor reciben en servidor.__handle_game_active()


# Function that handles incoming new connections for matches
class StreamSocket(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.matchId = None
        self.player_1 = None
        self.game_task = None
        self.__message_handlers = {
            'connectToMatch': self.__handle_MatchSessionPairing,
            "update": self.__handle_update,
            "game_active": self.__handle_game_active,
            "reset_game": self.__handle_reset_game
        }

    async def connect(self):
        """
        Called when the websocket is handshaking as part of initial connection.
        """
        try:
            # Accept the connection
            await self.accept()
            logger.info("New client connected")

            # Create a new game session for this connection
            self.matchId = f"local_{id(self)}"  # Unique ID for this connection
            if not session_manager.createGame(self.matchId, self.scope['user'].username):
                raise Exception("Failed to create game")
            self.player_1 = self.scope['user'].username
            logger.info(f"Game created for {self.player_1}")

            # Add this connection to the game's group
            await self.channel_layer.group_add(self.matchId, self.channel_name)

            # Start the game loop
            self.game_task = asyncio.create_task(self.game_loop())
            if not session_manager.setGameTask(self.matchId, self.game_task):
                raise Exception("Failed to set game task")
            
            logger.info("Game loop started")

        except Exception as e:
            logger.error(f"Error in connect: {str(e)}")
            if hasattr(self, 'matchId'):
                session_manager.removeGame(self.matchId)
            await self.close(code=1011)  # Internal error

    async def disconnect(self, close_code):
        """
        Called when the WebSocket closes for any reason.
        """
        try:
            logger.info(f"Client disconnected with code: {close_code}")
            
            if hasattr(self, 'matchId'):
                # Cancel our game task if it exists
                if self.game_task and not self.game_task.done():
                    self.game_task.cancel()
                    try:
                        await self.game_task
                    except asyncio.CancelledError:
                        pass  # Expected when cancelling
                    except Exception as e:
                        logger.error(f"Error cancelling game task: {str(e)}")
                
                # Remove from session manager
                session_manager.removeGameTask(self.matchId)
                session_manager.removeGame(self.matchId)
                
                # Remove from the game group
                await self.channel_layer.group_discard(self.matchId, self.channel_name)
                
                logger.info(f"Cleaned up game {self.matchId}")
            
        except Exception as e:
            logger.error(f"Error in disconnect: {str(e)}")
            # No need to re-raise as we're disconnecting anyway

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get("type", None)

            if message_type in self.__message_handlers:
                await self.__message_handlers[message_type](data)
            else:
                logger.warning(f"Unknown message type: {message_type}")
                await self.send(json.dumps({"type": "error", "message": "Unknown message type"}))
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
            await self.send(json.dumps({"type": "error", "message": "Invalid JSON"}))
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            await self.send(json.dumps({"type": "error", "message": "Internal server error"}))

    async def __handle_update(self, data):
        """Processes paddle movement updates"""
        if not self.matchId:
            logger.warning("No match ID for update")
            return

        direction = data.get("direction")
        side = data.get("side")
        if not direction or not side:
            logger.warning(f"Invalid paddle update data: {data}")
            return

        game = session_manager.getGameObject(self.matchId)
        if not game:
            logger.warning("Game not found")
            return

        # Move the specified paddle and log the movement
        logger.debug(f"Moving {side} paddle {direction}")
        game.move_players(side, direction)
        
        # Send immediate paddle position update
        state = game.get_gameState()
        await self.channel_layer.group_send(
            self.matchId,
            {
                "type": "game_update",
                "message": {
                    "type": "game_update",
                    "players": state["players"],
                    "ball": state["ball"],
                    "active": state["active"]
                }
            }
        )

    async def __handle_game_active(self, data):
        """Handle game activation/deactivation"""
        if not self.matchId:
            logger.warning("No match ID for game_active update")
            return

        game = session_manager.getGameObject(self.matchId)
        if not game:
            logger.warning("Game not found for game_active update")
            return

        try:
            is_active = data.get("game_active", False)
            logger.info(f"Setting game active state to: {is_active}")
            
            if is_active:
                # Reset ball position and set initial velocity
                game.reset_ball(random.choice(['left', 'right']))
                game.SetGameActive(True)
                
                # Send immediate state update
                state = game.get_gameState()
                logger.info(f"Game activated with state: {state}")
                logger.info(f"Ball velocity: rx={state['ball'].get('rx', 0)}, ry={state['ball'].get('ry', 0)}")
                
                await self.channel_layer.group_send(
                    self.matchId,
                    {
                        "type": "game_update",
                        "message": {
                            "type": "game_update",
                            "players": state["players"],
                            "ball": state["ball"],
                            "active": state["active"]
                        }
                    }
                )
            else:
                # Stop the game
                game.SetGameActive(False)
                state = game.get_gameState()
                
                await self.channel_layer.group_send(
                    self.matchId,
                    {
                        "type": "game_update",
                        "message": {
                            "type": "game_update",
                            "players": state["players"],
                            "ball": state["ball"],
                            "active": False
                        }
                    }
                )
                
        except Exception as e:
            logger.error(f"Error handling game activation: {str(e)}")
            await self.send(json.dumps({
                "type": "error",
                "message": "Failed to update game state"
            }))

    async def __handle_reset_game(self, data):
        if not self.matchId:
            return

        game = session_manager.getGameObject(self.matchId)
        if game:
            game.reset_game()

    async def game_loop(self):
        """Main game loop that updates and broadcasts game state"""
        logger.info(f"Game loop started for match {self.matchId}")
        game = session_manager.getGameObject(self.matchId)
        if not game:
            logger.error(f"No game object found for match {self.matchId}")
            await self.close(code=1011)  # Internal error
            return

        frame_count = 0
        update_interval = 1.0 / 60  # 60 FPS
        last_state = None
        
        try:
            while True:
                loop_start = asyncio.get_event_loop().time()
                
                if game.IsGameActive():
                    try:
                        # Update game state
                        game.update_ball()
                        state = game.get_gameState()
                        frame_count += 1
                        
                        # Only send updates if the state has changed
                        current_state = json.dumps({
                            'ball': state['ball'],
                            'players': state['players']
                        })
                        
                        if current_state != last_state:
                            last_state = current_state
                            # Log every state change
                            logger.debug(
                                f"Game state update: "
                                f"Ball pos=({state['ball']['x']:.1f}, {state['ball']['y']:.1f}), "
                                f"Ball vel=({state['ball'].get('rx', 0):.1f}, {state['ball'].get('ry', 0):.1f}), "
                                f"Left paddle={state['players']['left']['y']:.1f}, "
                                f"Right paddle={state['players']['right']['y']:.1f}"
                            )
                            
                            # Send update to all clients in the group
                            await self.channel_layer.group_send(
                                self.matchId,
                                {
                                    "type": "game_update",
                                    "message": {
                                        "type": "game_update",
                                        "players": state["players"],
                                        "ball": state["ball"],
                                        "active": state["active"]
                                    }
                                }
                            )
                    except Exception as e:
                        logger.error(f"Error updating game state: {str(e)}")
                        continue  # Continue the loop even if there's an error
                
                # Calculate and maintain frame rate
                elapsed = asyncio.get_event_loop().time() - loop_start
                sleep_time = max(0, update_interval - elapsed)
                await asyncio.sleep(sleep_time)
                
        except asyncio.CancelledError:
            logger.info(f"Game loop cancelled for match {self.matchId}")
            raise
        except Exception as e:
            logger.error(f"Fatal error in game loop: {str(e)}")
            await self.send(json.dumps({
                "type": "error",
                "message": "Game stopped due to server error"
            }))
            raise

    async def game_update(self, event):
        """Handler for game update messages from group send"""
        try:
            logger.debug(f"Sending game update to client: {event['message']}")
            await self.send(text_data=json.dumps(event["message"]))
        except Exception as e:
            logger.error(f"Error sending game update: {str(e)}")
            # Don't close the connection here, just log the error

    async def __handle_MatchSessionPairing(self, data):
        """This is not used for local games"""
        pass
