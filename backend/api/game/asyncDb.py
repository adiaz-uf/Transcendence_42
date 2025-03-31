from channels.db import database_sync_to_async
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
import logging

logger = logging.getLogger(__name__)



@database_sync_to_async
def async_get_User_instance(userId):
    try:
        from api.models import UserProfile

        return UserProfile.objects.get(pk=userId)
    except ObjectDoesNotExist:
        logger.info("User not found")
        return False
    except MultipleObjectsReturned:
        logger.info("Multiple user found")
        return False
    except Exception as e:
        logger.info(f"An error occurred: {e}")
        return False


@database_sync_to_async
def async_get_Match_instance(matchId):
    try:
        from api.models import Match
        return Match.objects.get(pk=matchId)
    except ObjectDoesNotExist:
        logger.info("Match not found")
        return False
    except MultipleObjectsReturned:
        logger.info("Multiple matches found")
        return False
    except Exception as e:
        logger.info(f"An error occurred: {e}")
        return False

@database_sync_to_async #storing maybe perjudicial
def async_save_match_instance(match_db_instance):
    try:
        match_db_instance.save()
        return True
    except:
        return False


# Returns an integer indicating the player number in the match
async def IsPlayerinMatch(matchId, userId):
        if not (await async_get_User_instance(userId)):
            logger.info("User not found")
            raise ObjectDoesNotExist("User not found")
        
        match_db_instance = await async_get_Match_instance(matchId)
        if not match_db_instance:
            raise ObjectDoesNotExist("Match not found")
        # Check if player requesting is leftplayer (creator)
        if match_db_instance.player_left == userId:
            return 1
        else:  # No? Maybe player right 
            if match_db_instance.player_right == userId:  # Are you player 2 
                return 2
        return 0

async def IsMultiplayerMatch(matchId):
    from api.models import Match
    match_db_instance = await async_get_Match_instance(matchId)
    
    if not match_db_instance:
        raise ObjectDoesNotExist("Match not found")
    return match_db_instance.is_multiplayer

