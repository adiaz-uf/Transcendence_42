from django.db import models
from django.contrib.auth.models import User, AbstractUser, Group, Permission
from django.db.models import Model

class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    create_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")

    def __str__(self):
        return self.title
      
# Create your models here.
class UserProfile(AbstractUser):
    given_name = models.CharField(max_length=35, null=True, blank=True)
    surname = models.CharField(max_length=35, null=True, blank=True)
    
    # overriding the groups and user_permissions inherited from AbstractUser
    groups = models.ManyToManyField(
        Group,
        related_name="user_profiles",
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="user_profiles",
        blank=True
    )

    def __str__(self):
        return self.username


class Tournament(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=35)
    created_at = models.DateTimeField(editable=False, null=True)
    owner = models.ForeignKey(UserProfile, on_delete=models.CASCADE, null=True)
    matches = models.ManyToManyField("Match", related_name="matches")

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

    def __str__(self):
        return self.name

class Team(models.Model):
    name = models.CharField(max_length=35)
    match_id = models.ForeignKey(Match, on_delete=models.CASCADE)
    player1_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="player1_id")
    player2_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE, null=True, related_name="player2_id")

    def __str__(self):
        return self.name


# not sure if ball_duration actually calculates the live ball duration
class GoalStat(models.Model):
    user_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    match_id = models.ForeignKey(Match, on_delete=models.CASCADE)
    hit_corners = models.PositiveIntegerField()
    ball_duration = models.DurationField()
    pos_y = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return self.name
