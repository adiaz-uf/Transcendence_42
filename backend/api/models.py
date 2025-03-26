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
    is_42user = models.BooleanField(default=False)
    first_name = None
    last_name = None

    class Meta:
        db_table = 'user'

    def __str__(self):
        return self.username


class Tournament(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

class Team(models.Model):
    name = models.CharField(max_length=100)
    tournament = models.ForeignKey(Tournament, related_name='teams', on_delete=models.CASCADE)
    player1_id = models.IntegerField()
    player2_id = models.IntegerField(null=True, blank=True)

class Match(models.Model):
    tournament = models.ForeignKey(Tournament, related_name='matches', on_delete=models.CASCADE)
    team_left = models.ForeignKey(Team, related_name='left_matches', on_delete=models.CASCADE)
    team_right = models.ForeignKey(Team, related_name='right_matches', on_delete=models.CASCADE)
    winner = models.ForeignKey(Team, null=True, blank=True, on_delete=models.SET_NULL)


class GoalStat(models.Model):
    user_id = models.ForeignKey('UserProfile', on_delete=models.CASCADE)
    match_id = models.ForeignKey('Match', on_delete=models.CASCADE)
    hit_corners = models.PositiveIntegerField()
    ball_duration = models.DurationField()
    pos_y = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        db_table = 'goalstat'

    def __str__(self):
        return f"GoalStat for Match {self.match_id.id} (User {self.user_id.username})"
