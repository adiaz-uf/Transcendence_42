from django.urls import path
from . import views

urlpatterns = [
    path("notes/", views.NoteListCreate.as_view(), name="note-list"),
    path("notes/delete/<int:pk>/", views.NoteDelete.as_view(), name="delete-note"),
    path("tournament/", views.CreateTournamentView.as_view(), name="tournament"),
    path("match/", views.CreateMatchView.as_view(), name="match"),

]
