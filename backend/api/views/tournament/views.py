from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django_otp.plugins.otp_totp.models import TOTPDevice

import logging
logger = logging.getLogger(__name__)

from api.models import Tournament, Match, UserProfile
from api.serializer.tournament.serializer import TournamentSerializer


class CreateTournamentView(generics.CreateAPIView):
    serializer_class = TournamentSerializer
    queryset = Tournament.objects.all()
    permission_classes = [IsAuthenticated]
    

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class TournamentDetailView(APIView):
    serializer_class = TournamentSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, tournament_id):
        try:
            tournament = Tournament.objects.get(id=tournament_id)
            serializer = TournamentSerializer(tournament)
            return Response(serializer.data)

        except Tournament.DoesNotExist:
            return Response({"error": "Tournament not found"}, status=404)

class AddMatchToTournamentView(generics.UpdateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        tournament = self.get_object()
        match_id = request.data.get('pkMatch', None)

        if not match_id:
            return Response(
                {"error": "No match ID provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            match = Match.objects.get(id=match_id)
        except Match.DoesNotExist:
            return Response(
                {"error": "Invalid match ID provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        logger.info(f"Received match ID: {match_id} for tournament {tournament.id}")
        logger.info(f"Adding match to tournament: {tournament.id}, current matches: {tournament.matches.all()}")
        tournament.matches.add(match)
        logger.info(f"Match added to tournament: {tournament.matches.all()}")

        return Response(
            {"message": "Match added to tournament successfully."},
            status=status.HTTP_200_OK
        )

class AddWinnerToTournamentView(generics.UpdateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        tournament = self.get_object()
        winner = request.data.get('pkUser', None)

        if not winner:
            return Response(
                {"error": "No winner ID provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            winner = UserProfile.objects.get(id=winner)
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "Invalid winner ID provided."},
                status=status.HTTP_400_BAD_REQUEST
               )

        logger.info(f"Received winner ID: {winner} for tournament {tournament.id}")
        logger.info(f"Setting winner for tournament {tournament.id} to {winner.id}")
        tournament.winner = winner
        tournament.save()
        logger.info(f"Winner added to tournament: {tournament.matches.all()}")

        return Response(
            {"message": "Winner added to tournament successfully."},
            status=status.HTTP_200_OK
        )


# Will provide an empty dataset if user doesnt match any winner or if
# user doesnt exist.
class UserTournWinnerCountView(generics.ListAPIView):
    serializer_class = TournamentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):

        user_id = self.request.data.get('UserID', None)

        if not user_id:
            return Tournament.objects.none()
        try:
            user_id = UserProfile.objects.get(id=user_id)
        except UserProfile.DoesNotExist:
            return Tournament.objects.none()


        return Tournament.objects.filter(winner=user_id)

    def get(self, request, *args, **kwargs):
        tournaments = self.get_queryset()
        count = tournaments.count()
        return Response({"Tournament Win Count": count}, status=status.HTTP_200_OK)

class UserParticipationCountView(generics.ListAPIView):
    serializer_class = TournamentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):

        user_id = self.request.data.get('UserID', None)

        if not user_id:
            return Tournament.objects.none()
        try:
            user_id = UserProfile.objects.get(id=user_id)
        except UserProfile.DoesNotExist:
            return Tournament.objects.none()
        return Tournament.objects.filter(players=user_id)

    def get(self, request, *args, **kwargs):
        tournaments = self.get_queryset()
        count = tournaments.count()
        return Response({"Tournament Particcipation Count": count}, status=status.HTTP_200_OK)