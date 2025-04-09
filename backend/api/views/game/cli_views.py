from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle
from django.core.exceptions import ObjectDoesNotExist
import logging

from api.models import Match, UserProfile
from api.game.pongame import PongGame
from api.game.session_manager import session_manager

logger = logging.getLogger(__name__)

class GameRateThrottle(UserRateThrottle):
    rate = '100/minute'  # Adjust this value based on your needs

class BaseGameView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [GameRateThrottle]

    def validate_game_access(self, match_id, user):
        try:
            match = Match.objects.get(id=match_id)
            return user in [match.player_left, match.player_right]
        except ObjectDoesNotExist:
            return False

class GameStateView(BaseGameView):
    def get(self, request, match_id):
        try:
            if not self.validate_game_access(match_id, request.user):
                return Response(
                    {"error": "Unauthorized access to game"},
                    status=status.HTTP_403_FORBIDDEN
                )

            game = session_manager.getGameObject(match_id)
            if not game:
                return Response(
                    {"error": "No active game found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            return Response({
                "ball_position": game.get_ball_position(),
                "player_positions": game.get_player_positions(),
                "scores": game.get_scores(),
                "is_active": game.is_active()
            })
        except Exception as e:
            logger.error(f"Error in GameStateView: {str(e)}")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class GameControlView(BaseGameView):
    def post(self, request, match_id):
        try:
            if not self.validate_game_access(match_id, request.user):
                return Response(
                    {"error": "Unauthorized access to game"},
                    status=status.HTTP_403_FORBIDDEN
                )

            action = request.data.get('action')
            if action not in ['start', 'pause', 'reset']:
                return Response(
                    {"error": "Invalid action"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            game = session_manager.getGameObject(match_id)
            if not game:
                return Response(
                    {"error": "No active game found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            if action == 'start':
                game.SetGameActive(True)
            elif action == 'pause':
                game.SetGameActive(False)
            elif action == 'reset':
                game.reset_game()

            return Response({"status": "success"})
        except Exception as e:
            logger.error(f"Error in GameControlView: {str(e)}")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PlayerMoveView(BaseGameView):
    def post(self, request, match_id):
        try:
            if not self.validate_game_access(match_id, request.user):
                return Response(
                    {"error": "Unauthorized access to game"},
                    status=status.HTTP_403_FORBIDDEN
                )

            left_move = request.data.get('left_move')
            right_move = request.data.get('right_move')

            # Validate input types
            if not isinstance(left_move, (int, float)) or not isinstance(right_move, (int, float)):
                return Response(
                    {"error": "Move values must be numeric"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            game = session_manager.getGameObject(match_id)
            if not game:
                return Response(
                    {"error": "No active game found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Convert numeric values to directions
            if left_move != 0:
                game.move_players('left', 'up' if left_move < 0 else 'down')
            if right_move != 0:
                game.move_players('right', 'up' if right_move < 0 else 'down')

            return Response({"status": "success"})
        except Exception as e:
            logger.error(f"Error in PlayerMoveView: {str(e)}")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class GameStatsView(BaseGameView):
    def get(self, request, match_id):
        try:
            if not self.validate_game_access(match_id, request.user):
                return Response(
                    {"error": "Unauthorized access to game"},
                    status=status.HTTP_403_FORBIDDEN
                )

            game = session_manager.getGameObject(match_id)
            if not game:
                return Response(
                    {"error": "No active game found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            return Response({
                "scores": game.get_scores(),
                "is_active": game.is_active(),
                "last_update": game.get_last_update_time()
            })
        except Exception as e:
            logger.error(f"Error in GameStatsView: {str(e)}")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 