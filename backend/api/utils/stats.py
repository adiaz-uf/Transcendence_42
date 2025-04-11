from api.models import UserStat, Match
from decimal import Decimal

def update_user_stats(match: Match):
    """
    Update user statistics after a match is completed.
    
    Args:
        match: The completed Match instance
    """
    if not match.player_left or not match.player_right:
        return

    # Get or create stats for both players
    left_stats, _ = UserStat.objects.get_or_create(
        user_id=match.player_left,
        defaults={
            'matches_played': 0,
            'max_score_goals': 0,
            'time_played': 0,
            'win_rate': 0
        }
    )
    
    right_stats, _ = UserStat.objects.get_or_create(
        user_id=match.player_right,
        defaults={
            'matches_played': 0,
            'max_score_goals': 0,
            'time_played': 0,
            'win_rate': 0
        }
    )

    # Update matches played
    left_stats.matches_played += 1
    right_stats.matches_played += 1

    # Update max score goals
    left_stats.max_score_goals = max(left_stats.max_score_goals, match.left_score)
    right_stats.max_score_goals = max(right_stats.max_score_goals, match.right_score)

    # Update time played (in hours)
    if match.match_duration:
        duration_hours = match.match_duration.total_seconds() / 3600
        left_stats.time_played += Decimal(str(duration_hours))
        right_stats.time_played += Decimal(str(duration_hours))

    # Update win rate
    if match.left_score > match.right_score:
        left_stats.win_rate = (left_stats.win_rate * (left_stats.matches_played - 1) + 1) / left_stats.matches_played
        right_stats.win_rate = (right_stats.win_rate * (right_stats.matches_played - 1) + 0) / right_stats.matches_played
    elif match.right_score > match.left_score:
        left_stats.win_rate = (left_stats.win_rate * (left_stats.matches_played - 1) + 0) / left_stats.matches_played
        right_stats.win_rate = (right_stats.win_rate * (right_stats.matches_played - 1) + 1) / right_stats.matches_played
    else:  # Draw
        left_stats.win_rate = (left_stats.win_rate * (left_stats.matches_played - 1) + 0.5) / left_stats.matches_played
        right_stats.win_rate = (right_stats.win_rate * (right_stats.matches_played - 1) + 0.5) / right_stats.matches_played

    # Save the updates
    left_stats.save()
    right_stats.save() 