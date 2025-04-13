from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from .blockchain_utils import get_tournament_scores, send_score_to_blockchain

class TournamentBlockchainScoresView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, tournament_id):
        try:
            # Convert tournament ID to integer (first 8 characters of hex)
            tournament_id_int = int(tournament_id[:8], 16)
            scores = get_tournament_scores(tournament_id_int)
            return Response({"scores": scores})
        except Exception as e:
            return Response({"error": str(e)}, status=500)

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def blockchain_score(request):
    """
    Production endpoint for blockchain score functionality.
    POST: Adds a score to the blockchain
    GET: Retrieves scores for a tournament
    """
    try:
        if request.method == 'POST':
            # Get data from request body
            tournament_id = request.data.get('tournament_id')
            score_left = request.data.get('score_left')
            score_right = request.data.get('score_right')

            # Validate required fields
            if any(v is None for v in [tournament_id, score_left, score_right]):
                return Response({"error": "Missing required fields"}, status=400)

            # Add score
            success = send_score_to_blockchain(tournament_id, score_left, score_right)
            if not success:
                return Response({"error": "Failed to add score"}, status=500)

            return Response({
                "message": "Score added successfully",
                "tournament_id": tournament_id,
                "score_left": score_left,
                "score_right": score_right
            })
        else:  # GET request
            # Get tournament_id from query params or use default
            tournament_id = request.query_params.get('tournament_id', 123)
            # Get scores
            scores = get_tournament_scores(tournament_id)
            return Response({
                "tournament_id": tournament_id,
                "scores": scores
            })
    except Exception as e:
        return Response({"error": str(e)}, status=500) 