from django.urls import path
from . import views

urlpatterns = [
    path("user/profile/update/", views.ProfileUpdateView.as_view(), name="update-profile"),
    path("tournament/", views.CreateTournamentView.as_view(), name="tournament"),
    path("match/", views.CreateMatchView.as_view(), name="match"),
    path("auth/42/callback/", views.FTAuthCallbackView.as_view(), name="ft_callback"),
]
