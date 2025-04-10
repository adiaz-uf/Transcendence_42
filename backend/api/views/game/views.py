from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from api.views.blockchain.blockchain_utils import send_score_to_blockchain, get_tournament_scores

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def test_blockchain(request):
    """
    Test endpoint for blockchain functionality.
    POST: Adds a test score
    GET: Retrieves scores for the test tournament
    """
    try:
        tournament_id = 123  # Using a simple numeric ID for testing

        if request.method == 'POST':
            # Test data for adding score
            score_left = 10
            score_right = 5

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
            # Get scores
            scores = get_tournament_scores(tournament_id)
            return Response({
                "tournament_id": tournament_id,
                "scores": scores
            })
    except Exception as e:
        return Response({"error": str(e)}, status=500)