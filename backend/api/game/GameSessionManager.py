import asyncio
import json
from .pongame import PongGame

class GameSessionManager:
    def __init__(self):
        self.sessions = {}

    def create_session(self, match_id, user_id, channel_name):
        """Creates a new match session"""
        if match_id not in self.sessions:
            self.sessions[match_id] = {
                "player1": {"id": user_id, "channel_name": channel_name},
                "player2": None,
                "game": None,
                "gameTask": None
            }
            return True
        return False

    def join_session(self, match_id, user_id, channel_name):
        """Allows a second player to join an existing session"""
        if match_id in self.sessions and not self.sessions[match_id]["player2"]:
            self.sessions[match_id]["player2"] = {"id": user_id, "channel_name": channel_name}
            if self.sessions[match_id]["game"]:
                self.sessions[match_id]["game"].set_player2(user_id)
            return True
        return False

    def set_channel(self, match_id, user_id, channel_name):
        """Updates WebSocket channel name for a user"""
        if match_id in self.sessions:
            for key in ["player1", "player2"]:
                player = self.sessions[match_id].get(key)
                if player and player["id"] == user_id:
                    player["channel_name"] = channel_name
                    return True
        return False

    def getSession(self, match_id):
        """Returns the session for a match"""
        return self.sessions.get(match_id)

    def getGameObject(self, match_id):
        """Returns the PongGame instance"""
        if match_id in self.sessions:
            return self.sessions[match_id]["game"]
        return None

    def setGameObject(self, match_id, game):
        """Sets the game object for a session"""
        if match_id in self.sessions:
            self.sessions[match_id]["game"] = game
            return True
        return False

    def getGameTask(self, match_id):
        """Returns the game loop task"""
        if match_id in self.sessions:
            return self.sessions[match_id]["gameTask"]
        return None

    def setGameTask(self, match_id, task):
        """Sets the game loop task"""
        if match_id in self.sessions:
            self.sessions[match_id]["gameTask"] = task
            return True
        return False

    def remove_session(self, match_id):
        """Removes a session and cleans up resources"""
        if match_id in self.sessions:
            task = self.sessions[match_id].get("gameTask")
            if task and not task.done():
                task.cancel()
            del self.sessions[match_id]
            return True
        return False
