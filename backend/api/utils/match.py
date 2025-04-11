from api.models import Match
from api.utils.stats import update_user_stats
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

async def update_match_score(match_id, left_score, right_score):
    """
    Update the match score and duration, then update user stats.
    
    Args:
        match_id: UUID of the match
        left_score: Score of the left player
        right_score: Score of the right player
    """
    try:
        match = Match.objects.get(pk=match_id)
        match.left_score = left_score
        match.right_score = right_score
        match.match_duration = timezone.now() - match.date
        match.save()
        
        # Update user stats
        update_user_stats(match)
        
        logger.info(f"Match {match_id} completed. Score: {left_score}-{right_score}")
        return True
    except Match.DoesNotExist:
        logger.error(f"Match {match_id} not found")
        return False
    except Exception as e:
        logger.error(f"Error updating match score: {str(e)}")
        return False 