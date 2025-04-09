from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .blockchain_utils import get_tournament_scores

class TournamentBlockchainScoresView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, tournament_id):
        try:
            scores = get_tournament_scores(tournament_id)
            return Response({"scores": scores})
        except Exception as e:
            return Response({"error": str(e)}, status=500) 