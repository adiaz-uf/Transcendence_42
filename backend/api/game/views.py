from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .blockchain_utils import add_score, get_scores

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_blockchain(request):
    """
    Test endpoint for blockchain functionality.
    Adds a test score and then retrieves it.
    """
    try:
        # Test data
        tournament_id = "test_tournament_123"
        match_id = "test_match_456"
        score = 10

        # Add score
        success = add_score(tournament_id, match_id, score)
        if not success:
            return Response({"error": "Failed to add score"}, status=500)

        # Get scores
        scores = get_scores(tournament_id)
        
        return Response({
            "message": "Blockchain test successful",
            "scores": scores
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500) 