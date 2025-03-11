from django.urls import path
from . import views

urlpatterns = [
    path("notes/", views.NoteListCreate.as_view(), name="note-list"),
    path("notes/delete/<int:pk>/", views.NoteDelete.as_view(), name="delete-note"),
    path("user/profile/update/", views.ProfileUpdateView.as_view(), name="update-profile"),
    path("tournament/", views.CreateTournamentView.as_view(), name="tournament"),
    path("match/", views.CreateMatchView.as_view(), name="match"),
    path('auth/42/callback/', FTAuthCallbackView.as_view(), name='ft_callback'),

]
