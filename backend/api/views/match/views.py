from rest_framework import generics, status

from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from datetime import timedelta

import logging
logger = logging.getLogger(__name__)

from api.models import UserProfile, Match
from api.serializer.match.serializer import MatchSerializer

# CreateAPIView (POST only)
# ListAPIView (GET only)
# RetrieveAPIView (GET single object)
# UpdateAPIView (PUT/PATCH only)
# DestroyAPIView (DELETE only)
# ListCreateAPIView (GET + POST)
# RetrieveUpdateAPIView (GET + PUT/PATCH)
# RetrieveDestroyAPIView (GET + DELETE)
# RetrieveUpdateDestroyAPIView (GET + PUT/PATCH + DELETE)

#------------------------------------MAtches views -----------------------------------------

class AvailableMatchView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MatchSerializer

    def get_queryset(self):
        return Match.objects.filter(
                is_multiplayer=True,
                player_right=self.request.user)
        
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

    def get_queryset(self):
        """Filter UserProfile by username from req body"""
        username = self.request.data.get("username", None)  # Get from request body
        if not username:
            return UserProfile.objects.none()
        else:
            try:
                return UserProfile.objects.filter(username=username)
            except:
                return UserProfile.objects.none()
    def get_object(self):
        # Retrieve single Object from querySet
        queryset = self.get_queryset()
        if queryset.count() == 1:
            return queryset.first()
        return None

    def perform_create(self, serializer):
        """
        Override perform_create to set the match host (player_left).
        """
        player_right = self.get_object()
        # Save the match
        serializer.save(player_left=self.request.user,
                        player_right=player_right,
                        match_duration=timedelta(minutes=0, seconds=0),
                        left_score=0,
                        right_score=0,
                        is_multiplayer=self.request.data.get("is_multiplayer", False))
        if serializer.is_valid():
            return Response(
                {"message": "Match Created !", "match": serializer.validated_data},
                status=201
            )
        else:
            return Response({'error': 'No match created'}, status=400)

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
            return Response(
                {"message": "Scores updated successfully!", "match": MatchSerializer(match).data})
        else:
            
            return Response(
                {"message": "No changes detected."},)