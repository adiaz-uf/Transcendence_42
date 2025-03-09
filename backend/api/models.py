from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
      
# Create your models here.

class UserProfile(AbstractUser):
    given_name = models.CharField(max_length=35, null=True, blank=True)
    surname = models.CharField(max_length=35, null=True, blank=True)
   
    # 2FA
    totp_secret = models.CharField(max_length=64, blank=True, null=True)
    is_2fa_enabled = models.BooleanField(default=False)

    class Meta:
        db_table = 'user'
    def __str__(self):
        return self.username


class Tournament(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=35)
    created_at = models.DateTimeField(editable=False, null=True)
    owner = models.ForeignKey(UserProfile, on_delete=models.CASCADE, null=True)
    matches = models.ManyToManyField("Match", related_name="matches")

    class Meta:
        db_table = 'tournament'
    def __str__(self):
        return self.name


# can a match not be linked to a tournament
class Match(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    tournament_id = models.ForeignKey(Tournament, on_delete=models.CASCADE, null=True)
    team_left = models.ForeignKey("Team", on_delete=models.CASCADE, related_name="matches_as_left", null=True)
    team_right = models.ForeignKey("Team", on_delete=models.CASCADE, related_name="matches_as_right", null=True)
    left_score = models.PositiveIntegerField(default=0)
    right_score = models.PositiveIntegerField(default=0)
    is_multiplayer = models.BooleanField(default=False)

    class Meta:
        db_table = 'match'

    def __str__(self):
        return self.name

class Team(models.Model):
    name = models.CharField(max_length=35)
    player1_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="player1_id")
    player2_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE, null=True, related_name="player2_id")

    class Meta:
        db_table = 'team'

    def __str__(self):
        return self.name


# not sure if ball_duration actually calculates the live ball duration
class GoalStat(models.Model):
    user_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    match_id = models.ForeignKey(Match, on_delete=models.CASCADE)
    hit_corners = models.PositiveIntegerField()
    ball_duration = models.DurationField()
    pos_y = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        db_table = 'goalstat'
    def __str__(self):
        return self.name
