from .pongame import PongGame
import logging
import time
from typing import Dict, Optional, List
from django.core.cache import cache

logger = logging.getLogger(__name__)

class SessionManager:
    # Constants
    INACTIVE_TIMEOUT = 300  # 5 minutes
    CLEANUP_INTERVAL = 60   # 1 minute
    CACHE_PREFIX = 'pong_game_'
    CACHE_TIMEOUT = 3600    # 1 hour

    def __init__(self):
        self.games = {}
        self.tasks = {}
        self.last_cleanup = time.time()

    def createGame(self, matchId, player1, player2=None):
        """Create a new game instance"""
        try:
            if matchId in self.games:
                return False

            game = PongGame(player1, player2)
            self.games[matchId] = game
            # Persist the game to cache
            self._persist_game(matchId)
            logger.info(f"Created new game {matchId} for player {player1} vs {player2 or 'AI'}")
            return True
        except Exception as e:
            logger.error(f"Error creating game: {str(e)}")
            return False

    def getGameObject(self, matchId):
        """Get the game object for a match"""
        # First try to get from memory
        game = self.games.get(matchId)
        if game:
            return game
            
        # If not in memory, try to get from cache
        game = self._get_from_cache(matchId)
        if game:
            # Put back in memory for faster access
            self.games[matchId] = game
            return game
            
        return None

    def removeGame(self, matchId):
        """Remove a game instance"""
        if matchId in self.games:
            del self.games[matchId]
            logger.info(f"Removed game {matchId}")
            return True
        return False

    def setGameTask(self, matchId, task):
        """Set the game loop task for a match"""
        self.tasks[matchId] = task
        return True

    def getGameTask(self, matchId):
        """Get the game loop task for a match"""
        return self.tasks.get(matchId)

    def removeGameTask(self, matchId):
        """Remove the game loop task for a match"""
        if matchId in self.tasks:
            del self.tasks[matchId]
            return True
        return False

    def _cleanup_if_needed(self) -> None:
        """Clean up inactive games if enough time has passed"""
        current_time = time.time()
        if current_time - self.last_cleanup < self.CLEANUP_INTERVAL:
            return

        self.last_cleanup = current_time
        inactive_games = []

        for match_id, game in self.games.items():
            if current_time - game.get_last_update_time() > self.INACTIVE_TIMEOUT:
                inactive_games.append(match_id)
                logger.info(f"Marking game {match_id} as inactive")

        for match_id in inactive_games:
            self.removeGame(match_id)

    def get_active_games_count(self) -> int:
        """Get the number of active games"""
        return len(self.games)

    def get_game_info(self, matchId: str) -> Optional[dict]:
        """Get information about a specific game"""
        game = self.getGameObject(matchId)
        if not game:
            return None

        return game.get_game_state()

    def _persist_game(self, matchId: str) -> None:
        """Persist game state to cache"""
        game = self.games.get(matchId)
        if game:
            cache_key = f"{self.CACHE_PREFIX}{matchId}"
            cache.set(cache_key, game, self.CACHE_TIMEOUT)

    def _get_from_cache(self, matchId: str) -> Optional[PongGame]:
        """Get game state from cache"""
        cache_key = f"{self.CACHE_PREFIX}{matchId}"
        return cache.get(cache_key)

    def _remove_from_cache(self, matchId: str) -> None:
        """Remove game state from cache"""
        cache_key = f"{self.CACHE_PREFIX}{matchId}"
        cache.delete(cache_key)

    def get_all_games(self) -> List[dict]:
        """Get information about all games"""
        return [
            self.get_game_info(match_id)
            for match_id in self.games.keys()
        ]

    def cleanup_all_games(self) -> None:
        """Clean up all games"""
        for match_id in list(self.games.keys()):
            self.removeGame(match_id)

session_manager = SessionManager() 