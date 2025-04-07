import asyncio
import json
from .pongame import PongGame
from asyncio import Lock

class GameSessionManager:
    def __init__(self):
        self.sessions = {}  # {match_id: 
        self.__mutex = asyncio.Lock()  # Mutex for async operations
            #{ 
            #"player1": {"id":lol, "channel_name":str}, 
            #"player2": {...}, 
            #"game": PongGameObject,
            #"gameTask": AsyncGameLoopTask 
            #}
            #}

    async def create_session(self, match_id, user_id, channel_name):
        """ Creates a new match session with one player """
        async with self.__mutex:
            if match_id not in self.sessions:
                self.sessions[match_id] = {
                    "player1": {"id": user_id, "channel_name": channel_name},
                    "player2": None,
                    "game": PongGame(user_id),
                    "gameTask": None,
                    }
                return True
        return False

    async def join_session(self, match_id, user_id, channel_name):
        """ Allows a second player to join an existing session """
        async with self.__mutex:
            if match_id in self.sessions and not self.sessions[match_id]["player2"]:
                if (hasattr(self.sessions[match_id]["game"], "set_player2")):
                    self.sessions[match_id]["game"].set_player2(user_id)
                    self.sessions[match_id]["player2"] = {"id": user_id, "channel_name": channel_name}
                    return True
        return False

    async def set_channel(self, match_id, user_id, channel_name):
        """ Assigns WebSocket channel name to the user (reconection)"""
        for key in ["player1", "player2"]:
            async with self.__mutex:
                if self.sessions.get(match_id, {}).get(key, {}).get("id") == user_id:
                    self.sessions[match_id][key]["channel_name"] = channel_name

    # async def run_sessionMatch(self, matchId):
    #     async with self.__mutex:
    #         await self.sessions[matchId]["game"].SetGameActive(True)
    
    # def stop_session_GameTask(self, matchId):
    async def getSession(self, matchId):
        async with self.__mutex:
            return self.sessions.get(matchId, {})
        
    async def getGameObject(self, match_id):
        """ Returns the PongGame instance """
        async with self.__mutex:
            return self.sessions.get(match_id, {}).get("game")
    
    async def getGameTask(self, match_id):
        """ Returns the Pong async Task loop instance """

        async with self.__mutex:
            if match_id in self.sessions:
                return self.sessions[match_id]["gameTask"]

    async def setGameTask(self, matchId, AsyncGameLoopTask):
        """ Returns the Pong async Task loop instance """
        async with self.__mutex:
            if matchId in self.sessions and not self.sessions[matchId]["gameTask"]:
                self.sessions[matchId]["gameTask"] = AsyncGameLoopTask
                return True
        return False

    async def remove_session(self, match_id):
        """ Removes a session when game ends """
        async with self.__mutex:
            if match_id in self.sessions:
                del self.sessions[match_id]
                return True
        return False
