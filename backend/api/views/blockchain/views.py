from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from .blockchain_utils import (
    get_tournament_scores,
    send_score_to_blockchain,
    send_scores_to_blockchain_bulk,
)

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



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def blockchain_scores_bulk(request):
    """
    Body expected:
    {
       "tournament_id": 12345,
       "matches": [
         {"label": "Semifinal 1", "score_left": 5, "score_right": 3},
         {"label": "Semifinal 2", "score_left": 5, "score_right": 2},
         {"label": "Finale 🏆",   "score_left": 5, "score_right": 4}
       ]
    }
    """
    try:
        tournament_id = request.data.get('tournament_id')
        matches = request.data.get('matches', [])
        if tournament_id is None or not isinstance(matches, list) or not matches:
            return Response({"error": "Missing or invalid fields"}, status=400)

        pairs = []
        for i, m in enumerate(matches):
            label = m.get('label') or f"Match {i+1}"
            left = int(m.get('score_left', 0))
            right = int(m.get('score_right', 0))
            pairs.append((label, left, right))

        ok = send_scores_to_blockchain_bulk(int(tournament_id), pairs)
        if not ok:
            return Response({"error": "Failed to add bulk scores"}, status=500)
        return Response({"message": "Bulk scores added successfully", "count": len(pairs)})
    except Exception as e:
        logger.exception("bulk view error")
        return Response({"error": str(e)}, status=500)
