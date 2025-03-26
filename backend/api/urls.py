from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Users and auth
    path("users/", views.CreateUserView.as_view(), name="create-user"),
    path("users/list/", views.UserListView.as_view(), name="user-list"),
    path("user/profile/", views.ProfileView.as_view(), name="profile"),
    path("user/register/", views.CreateUserView.as_view(), name="register"),
    path("user/profile/update/", views.ProfileUpdateView.as_view(), name="update-profile"),
    path("token/", views.LoginView.as_view(), name="get_token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("setup-2fa/", views.Setup2FAView.as_view(), name="setup-2fa"),
    path("auth/42/callback/", views.FTAuthCallbackView.as_view(), name="ft_callback"),
    
    # Users stats
    path("user/matches-played/", views.MatchesPlayedView.as_view(), name="matches-played"),
    path("user/matches-won/", views.MatchesWonView.as_view(), name="matches-won"),
    
    # Tournament Team and Matchs
    path('tournament/', views.TournamentListView.as_view(), name='tournament-list'),
    path('tournament/create/', views.TournamentCreateView.as_view(), name='tournament-create'),
    path('tournament/<int:tournament_id>/add_teams/', views.AddTeamsView.as_view(), name='add-teams'),
    path('tournament/<int:tournament_id>/generate_matches/', views.GenerateMatchesView.as_view(), name='generate-matches'),
    path('tournament/<int:tournament_id>/', views.TournamentDetailView.as_view(), name='tournament-detail'),
    path("tournament/<int:tournament_id>/scores/", views.GetTournamentScoresView.as_view(), name="tournament-scores"),
    path("team/", views.TeamListCreateView.as_view(), name="team"),
    path("match/", views.CreateMatchView.as_view(), name="match"),
    path('match/list/', views.MatchListView.as_view(), name='match-list'),
    path("match/update-scores/", views.UpdateMatchScoresView.as_view(), name="update-match-scores"),
]
