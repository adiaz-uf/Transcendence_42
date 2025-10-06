from rest_framework import generics, status

from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from datetime import timedelta

import logging
logger = logging.getLogger(__name__)

from api.models import UserProfile, Match
from api.serializer.match.serializer import MatchSerializer
from api.game.session_manager import session_manager
from api.views.blockchain.blockchain_utils import send_score_to_blockchain
from api.game.game_constants import GAME_SETTINGS

from django.http import JsonResponse
import time

# CreateAPIView (POST only)
# ListAPIView (GET only)
# RetrieveAPIView (GET single object)
# UpdateAPIView (PUT/PATCH only)
# DestroyAPIView (DELETE only)
# ListCreateAPIView (GET + POST)
# RetrieveUpdateAPIView (GET + PUT/PATCH)
# RetrieveDestroyAPIView (GET + DELETE)
# RetrieveUpdateDestroyAPIView (GET + PUT/PATCH + DELETE)

#------------------------------------Game Settings -----------------------------------------
def game_settings(request):
    return JsonResponse(GAME_SETTINGS)



#------------------------------------MAtches views -----------------------------------------

class AvailableMatchView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MatchSerializer

    def get_queryset(self):
        return Match.objects.filter(
            is_multiplayer=True,
            player_right=self.request.user
        ).select_related('player_left', 'player_right')
        
class UserMatchListView(generics.ListAPIView):
    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        is_match_id = self.request.data.get("match-id", None)

        if is_match_id:
            return Match.objects.filter(pk=is_match_id)
        else:
            return Match.objects.filter(
                player_left=self.request.user
            ) | Match.objects.filter(
                player_right=self.request.user
            )


class MatchCreationView(generics.CreateAPIView):
    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """
        Override perform_create to set the match host (player_left).
        Ensures `player_right` is either a valid UserProfile or None.
        """
        print("This is the request data", self.request.data)
        player_right_id = self.request.data.get("player_right", None)
        player_left_id = self.request.data.get("player_left", None)
        player_right = None  # Initialize player_right to None by default
        player_left = None  # Initialize player_right to None by default

        if player_right_id:
            try:
                player_right = UserProfile.objects.get(id=player_right_id)
            except UserProfile.DoesNotExist:
                return Response({"error": "Invalid opponent ID"}, status=400)

        if player_left_id:
            try:
                player_left = UserProfile.objects.get(id=player_left_id)
            except UserProfile.DoesNotExist:
                return Response({"error": "Invalid opponent ID"}, status=400)

        # Save the match
        match = serializer.save(
            player_left=player_left,
            player_right=player_right,
            match_duration=timedelta(minutes=0, seconds=0),
            left_score=0,
            right_score=0,
            is_multiplayer=self.request.data.get("is_multiplayer", False),
            is_started=self.request.data.get("is_started", False),
        )

        # Initialize the game in the session manager
        player_right_username = player_right.username if player_right else None
        player_left_username = player_left.username if player_left else None

        if not session_manager.createGame(str(match.id), player_left_username, player_right_username):
            logger.error(f"Failed to create game for match {match.id}")
            return Response(
                {"error": "Failed to initialize game"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {"message": "Match Created!", "match_id": match.id}, status=201
        )


class CreateOnlineMatchView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    queryset = Match.objects.all()
    serializer_class = MatchSerializer 

    def post(self, request):
        player_left = request.data.get('player_left')
        player_right = request.data.get('player_right')
        is_multiplayer = request.data.get('is_multiplayer', False)
        left_score = request.data.get('left_score', 0)
        right_score = request.data.get('right_score', 0)
        is_started = request.data.get('is_started', False)

        is_multiplayer = True if is_multiplayer == 'true' or is_multiplayer is True else False
        is_started = True if is_started == 'true' or is_started is True else False
        # Crear un nuevo partido
        match = Match.objects.create(
            player_left_id=player_left,
            player_right_id=player_right,
            is_multiplayer=is_multiplayer,
            left_score=left_score,
            right_score=right_score,
            is_started=is_started,
        )

        # Initialize the game in the session manager
        if not session_manager.createGame(str(match.id), player_left, player_right):
            logger.error(f"Failed to create game for match {match.id}")
            return Response(
                {"error": "Failed to initialize game"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        serializer = MatchSerializer(match)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class MatchScoreUpdateView(generics.UpdateAPIView):
    """
    Updates Match info
    """
    queryset = Match.objects.all()
    serializer_class = MatchSerializer

    def update(self, request, *args, **kwargs):
        """
        Override update method to restrict updates to only scores and duration.
        Saves only if values are modified.
        """
        logger.info(f"Updating match {kwargs['pk']} with data: {request.data}")
        match = self.get_object()  
        data = request.data 
        updated = False

        for key in ["left_score", "right_score", "match_duration"]:
            if key in data: 
                received_value = data[key]
                if getattr(match, key) != received_value:
                    setattr(match, key, received_value)
                    updated = True

        if updated:
            match.save()
            
 #           # Check if match is part of a tournament and send score to blockchain
 #           try:
 #               tournament = match.tournament_set.first()
 #               if tournament:
 #                   # Convert UUID to a consistent integer representation for blockchain
 #                   tournament_id_int = int(str(tournament.id).replace('-', '')[:8], 16)
 #                   
 #                   # Try to store score in blockchain with retries
 #                   max_retries = 3
 #                   retry_delay = 2  # seconds
 #                   
 #                   for attempt in range(max_retries):
 #                       success = send_score_to_blockchain(
 #                           tournament_id_int,
 #                           match.left_score,
 #                           match.right_score
 #                       )
 #                       if success:
 #                           logger.info(f"Successfully stored score in blockchain for match {match.id} on attempt {attempt + 1}")
 #                           break
 #                       elif attempt < max_retries - 1:
 #                           logger.warning(f"Failed to store score in blockchain for match {match.id} on attempt {attempt + 1}, retrying in {retry_delay} seconds...")
 #                           time.sleep(retry_delay)
 #                       else:
 #                           logger.error(f"Failed to store score in blockchain for match {match.id} after {max_retries} attempts")
 #           except Exception as e:
 #               logger.error(f"Error storing score in blockchain: {str(e)}")
            
            return Response(
                {"message": "Scores updated successfully!", "match": MatchSerializer(match).data})
        else:
            return Response(
                {"message": "No changes detected."},)
