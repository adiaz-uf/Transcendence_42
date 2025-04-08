from .pongame import PongGame
import logging

logger = logging.getLogger(__name__)

class SessionManager:
    def __init__(self):
        self.games = {}
        self.tasks = {}

    def createGame(self, matchId, player1):
        """Create a new game instance"""
        try:
            if matchId in self.games:
                logger.warning(f"Game {matchId} already exists")
                return False

            game = PongGame(player1)
            self.games[matchId] = game
            logger.info(f"Created new game {matchId} for player {player1}")
            return True
        except Exception as e:
            logger.error(f"Error creating game: {str(e)}")
            return False

    def getGameObject(self, matchId):
        """Get the game object for a match"""
        return self.games.get(matchId)

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

session_manager = SessionManager() 