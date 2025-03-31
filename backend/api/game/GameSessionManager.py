import asyncio
import json

class GameSessionManager:
    def __init__(self):
        self.games = {}  # Stores active games
        self.async_tasks = set()

    def create_game(self, userId):
        """Creates a new game session if not already existing"""
        if match_id not in self.games:
            gameSession = GameSession(match_id)
            self.games[match_id] = (gameSession, )
            asyncio.create_task(self.games[match_id].game_loop())

    def get_game(self, match_id):
        """Returns the game session"""
        return self.games.get(match_id)

    def remove_game(self, match_id):
        """Ends and removes a game session"""
        if match_id in self.games:
            self.games[match_id].game_active = False
            del self.games[match_id]

game_manager = GameSessionManager()