from django.db import models
from django.contrib.auth.models import User

class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    create_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")

    def __str__(seld):
        return self.title

""" class Tournament(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    Semifinal1 = models.ForeignKey("Match", on_delete=models.SET_NULL, null=True)
    Semifinal2 = models.ForeignKey("Match", on_delete=models.SET_NULL, null=True)
    FinalMatch = models.ForeignKey("Match", on_delete=models.SET_NULL, null=True)

class Match(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    Player1 = models.ForeignKey("User", on_delete=models.SET_NULL, null=True)
    Player2 = models.ForeignKey("User", on_delete=models.SET_NULL, null=True)
    P1score = models.IntegerField()
    P2score = models.IntegerField() """



# Create your models here.
