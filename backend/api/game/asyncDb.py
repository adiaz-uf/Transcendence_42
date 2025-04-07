from channels.db import database_sync_to_async
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
import logging

logger = logging.getLogger(__name__)

@database_sync_to_async
def thread_IsPlayerinMatchDB(matchId, userId):
    try:
        from api.models import Match

        match_db_instance = Match.objects.get(pk=matchId)
        

        if match_db_instance.player_left_id == userId:
            print("Is Player left")
            return 1
        elif match_db_instance.player_right_id == userId:  # Are you player 2 
            print("Is Player right")
            return 2
        print("Not a player")
        return 0  # Not a player in the match
    except ObjectDoesNotExist:
        logger.info("Match not found")
        return 0
    except MultipleObjectsReturned:
        logger.info("Multiple matches found")
        return 0
    except Exception as e:
        logger.info(f"An error occurred: {e}")
        return 0

@database_sync_to_async
def thread_IsMultiplayerMatch(matchId):
    try:
        from api.models import Match

        match_db_instance = Match.objects.get(pk=matchId)
        if match_db_instance is None:
            logger.info("Match not found")
            return False
        print("Is multiplayer match: ", match_db_instance.is_multiplayer)
        return match_db_instance.is_multiplayer
    except ObjectDoesNotExist:
        logger.info("Match not found")
        return False
    except MultipleObjectsReturned:
        logger.info("Multiple matches found")
        return False
    except Exception as e:
        logger.info(f"An error occurred: {e}")
        return False


