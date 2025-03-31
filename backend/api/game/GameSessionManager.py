import asyncio
import json
from .pongame import PongGame

class GameSessionManager:
    def __init__(self):
        self.sessions = {}  # {match_id: 
            #{ 
            #"player1": {"id":lol, "channel_name":str}, 
            #"player2": {...}, 
            #"game": {PongGameObject, asyncGamelooptask} 
            #}
            #}

    def create_session(self, match_id, user_id, channel_name):
        """ Creates a new match session with one player """
        if match_id not in self.sessions:
            self.sessions[match_id] = {
                "player1": {"id": user_id, "channel_name": channel_name},
                "player2": None,
                "game": PongGame(user_id),
                "gameTask": None,
                }
            return True
        return False

    def join_session(self, match_id, user_id, channel_name):
        """ Allows a second player to join an existing session """
        if match_id in self.sessions and not self.sessions[match_id]["player2"]:
            if (hasattr(self.sessions[match_id]["game"], "set_player2")):
                self.sessions[match_id]["game"].set_player2(user_id)
                self.sessions[match_id]["player2"] = {"id": user_id, "channel_name": channel_name}
                return True
        return False

    def set_channel(self, match_id, user_id, channel_name):
        """ Assigns WebSocket channel name to the user (reconection)"""
        for key in ["player1", "player2"]:
            if self.sessions.get(match_id, {}).get(key, {}).get("id") == user_id:
                self.sessions[match_id][key]["channel_name"] = channel_name

    def run_sessionMatch(self, matchId):
            self.sessions[matchId]["game"].SetGameActive(True)
    
    # def stop_session_GameTask(self, matchId):
    def getSession(self, matchId):
        return self.sessions.get("matchId", {})
        
    def getGameObject(self, match_id):
        """ Returns the PongGame instance """
        return self.sessions.get(match_id, {}).get("game")
    
    def getGameTask(self, match_id):
        """ Returns the Pong async Task loop instance """
        return self.sessions.get(match_id, {}).get("gameTask")

    def setGameTask(self, matchId, AsyncGameLoopTask):
        """ Returns the Pong async Task loop instance """
        if match_id in self.sessions and not self.sessions[match_id]["gameTask"]:
            self.sessions[match_id]["gameTask"] = AsyncGameLoopTask
            return True
        return False

    def remove_session(self, match_id):
        """ Removes a session when game ends """
        if match_id in self.sessions:

            del self.sessions[match_id]
