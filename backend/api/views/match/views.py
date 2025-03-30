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
            return UserProfile.objects.filter(username=username)
    
    def get_object(self):
        # Retrieve single Object from querySet
        queryset = self.get_queryset()
        return queryset.first()

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
                        right_score=0)
        if serializer.is_valid():
            return Response(
                {"message": "Match Created !", "match": serializer.validated_data},
                status=201
            )
        else:
            return Response({'error': 'No match created'}, status=400)
        

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