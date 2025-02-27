from django.db import models
from django.contrib.auth.models import User

class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    create_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")

    def __str__(self):
        return self.title

class Match(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    Player1 = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="matches_as_player1")
    Player2 = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="matches_as_player2")
    P1score = models.IntegerField()
    P2score = models.IntegerField()

    def __str__(self):
        return f"Match between {self.Player1} and {self.Player2}"

class Tournament(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    Semifinal1 = models.ForeignKey(Match, on_delete=models.SET_NULL, null=True, related_name="tournaments_as_semifinal1")
    Semifinal2 = models.ForeignKey(Match, on_delete=models.SET_NULL, null=True, related_name="tournaments_as_semifinal2")
    FinalMatch = models.ForeignKey(Match, on_delete=models.SET_NULL, null=True, related_name="tournaments_as_finalmatch")

    def __str__(self):
        return f"Tournament on {self.date}"

