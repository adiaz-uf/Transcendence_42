from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
import uuid
      
# Main User Info for auth!
class UserProfile(AbstractUser): # AbstractUser has fields password
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email       = models.EmailField(unique=True)
    username    = models.CharField(unique=True, max_length=64)
    given_name  = models.CharField(max_length=35, null=True, blank=True)
    surname     = models.CharField(max_length=35, null=True, blank=True)
    last_active = models.DateTimeField(null=True, blank=True)
    first_name  = None
    last_name   = None
    friends     = models.ManyToManyField("self", symmetrical=True, blank=True)
    active      = models.BooleanField(default=False)

    # 2FA Security
    totp_secret = models.CharField(max_length=64, blank=True, null=True)
    is_2fa_enabled = models.BooleanField(default=False)
    is_42user = models.BooleanField(default=False)

    # Matches
    localmatches = models.ManyToManyField("Match", related_name="local_players")
    onlinematches = models.ManyToManyField("Match", related_name="online_players")

    class Meta:
        db_table = 'user'
        
    def __str__(self):
        return self.username
    
#match Info
class Match(models.Model):
    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date            = models.DateTimeField(auto_now_add=True)
    match_duration  = models.DurationField(null=True)
    player_left     = models.ForeignKey("UserProfile", on_delete=models.CASCADE, related_name="player_left", null=True)
    player_right    = models.ForeignKey("UserProfile", on_delete=models.CASCADE, related_name="player_right", null=True)
    left_score      = models.PositiveIntegerField(default=0)
    right_score     = models.PositiveIntegerField(default=0)
    is_multiplayer  = models.BooleanField(default=False)
    is_started      = models.BooleanField(default=False)

    class Meta:
        db_table = 'match'

    def __str__(self):
        return "{self.id} {self.player_left}:{left_score}vs{self.player_right}:{right_score} ONLINE:{is_multiplayer}"

#Tournament Info
class Tournament(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner       = models.ForeignKey("UserProfile", on_delete=models.CASCADE, null=True, related_name='owned_tournaments')
    winner      = models.ForeignKey("UserProfile", on_delete=models.CASCADE, null=True, related_name='winner_tournaments')
    players     = models.ManyToManyField("UserProfile")
    matches     = models.ManyToManyField("Match")

    class Meta:
        db_table = 'tournament'

    def __str__(self):
        return self.name
