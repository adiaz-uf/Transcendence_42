from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
import uuid
      
# Main User Info for auth!
class UserProfile(AbstractUser): # AbstractUser has fields password
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    username = models.CharField(unique=True, max_length=64)
    given_name = models.CharField(max_length=35, null=True, blank=True)
    surname = models.CharField(max_length=35, null=True, blank=True)
    last_active = models.DateTimeField(null=True, blank=True)
    first_name = None
    last_name = None

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
    date = models.DateTimeField(auto_now_add=True)
    match_duration = models.DurationField()
    player_left = models.ForeignKey("UserProfile", on_delete=models.CASCADE, related_name="player_left", null=True)
    player_right = models.ForeignKey("UserProfile", on_delete=models.CASCADE, related_name="player_right", null=True)
    left_score = models.PositiveIntegerField(default=0)
    right_score = models.PositiveIntegerField(default=0)
    is_multiplayer = models.BooleanField(default=False)
    is_started = models.BooleanField(default=False)

    class Meta:
        db_table = 'match'
        
    def __str__(self):
        return self.name

#Tournament Info
class Tournament(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=35)
    created_at = models.DateTimeField(editable=False, null=True)
    owner = models.ForeignKey(UserProfile, on_delete=models.CASCADE, null=True)
    matches = models.ManyToManyField("Match")

    class Meta:
        db_table = 'tournament'
    def __str__(self):
        return self.name


# Stats of the User
class UserStat(models.Model):
    user_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    matches_played = models.DecimalField(max_digits=5, decimal_places=0)
    max_score_goals = models.PositiveIntegerField()
    time_played = models.DecimalField(max_digits=5, decimal_places=3)
    win_rate = models.DecimalField(max_digits=3, decimal_places=3)
    
    class Meta:
        db_table = 'UserStat'

    def __str__(self):
        return self.name

class GoalStat(models.Model):
    user_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    match_id = models.ForeignKey(Match, on_delete=models.CASCADE)
    ball_duration = models.DurationField()
    pos_y = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        db_table = 'goalstat'
    def __str__(self):
        return self.name    
