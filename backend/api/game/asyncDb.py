from channels.db import database_sync_to_async
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
import logging

logger = logging.getLogger(__name__)

@database_sync_to_async
def get_match_instance(matchId):
    return Match.objects.get(pk=matchId)

@database_sync_to_async
def save_match_instance(match_db_instance):
    match_db_instance.save()

async def get_match(matchId, userId):
    try:
        # Check if the match exists in the database
        match_db_instance = await get_match_instance(matchId)

        # Check if player requesting is leftplayer (creator)
        if match_db_instance.player_left == userId:
            return True
        else:  # No? Maybe player right (invited)
            if match_db_instance.player_right == userId:  # Have you connected before?
                return True
            if match_db_instance.player_right:  # Already someone in the match :(
                logger.info("Match already started")
                return False
            else:
                match_db_instance.player_right = userId  # All yours
                await save_match_instance(match_db_instance)  # Save the updated match instance ASYNCRONOUUUSLYY
                return True
    except ObjectDoesNotExist:
        logger.info("Match not found")
        return False
    except MultipleObjectsReturned:
        logger.info("Multiple matches found")
        return False
    except Exception as e:
        logger.info(f"An error occurred: {e}")
        return False
