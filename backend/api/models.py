from django.db import models
from django.contrib.auth.models import User
from django.db.models import Model

class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    create_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")

    def __str__(seld):
        return self.title


# Create your models here.

# change password so it's hashed
class UserProfile(models.Model):
    username = models.CharField(max_length=20, unique=True)
    email = models.EmailField(max_length=254, unique=True)
    password = models.CharField(max_length=60)
    given_name = models.CharField(max_length=35)
    surname = models.CharField(max_length=35)

    def __str__(self):
        return self.name


class Tournament(models.Model):
    created_at = models.DateTimeField(editable=False)
    owner = models.ForeignKey(UserProfile, on_delete=models.CASCADE)

    def __str__(self):
        return self.name


# can a match not be linked to a tournament
class Match(models.Model):
    tournament_id = models.ForeignKey(Tournament, on_delete=models.CASCADE, null=True)
    team_left = models.ForeignKey(Team, on_delete=models.CASCADE)
    team_right = models.ForeignKey(Team, on_delete=models.CASCADE)
    GAMES_MODES = {
        SINGLEPLAYER: "SINGLEPLAYER",
        MULTIPLAYER: "MULTIPLAYER",
    }
    game_mode = models.CharField(choices=GAMES_MODES, default=SINGLEPLAYER)

    def __str__(self):
        return self.name


class Team(models.Model):
    score = models.PositiveIntegerField()
    match_id = models.ForeignKey(Match, on_delete=models.CASCADE)
    player1_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    player2_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.name



# not sure if ball_duration actually calculates the live ball duration
class GoalStat(models.Model):
    user_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    hit_corners = models.PositiveIntegerField()
    ball_duration = models.DurationField()
    pos_y = models.DecimalField(max_digits=5, decimal_places=2)
    match_id = models.ForeignKey(Match, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
