from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView

from .views import *

urlpatterns = [
    path("tournament/", CreateTournamentView.as_view(), name="tournament"),
    path("match/", CreateMatchView.as_view(), name="match"),
    path("auth/42/callback/", FTAuthCallbackView.as_view(), name="ft_callback"),
    path("check_username/<str:username>/", CheckUsernameView.as_view(), name="check_username"),
    path("user/login/", LoginView.as_view(), name='login'),
    path("user/register/", CreateUserView.as_view(), name='register'),
    path("user/profile/", ProfileView.as_view(), name='profile'),
    path("user/refresh/", TokenRefreshView.as_view(), name='refresh'),

    path("setup-2fa/", Setup2FAView.as_view(), name='setup2fa'),
    path("auth/42/callback/", FTAuthCallbackView.as_view(), name='ft_callback'),

    # Matches
    path('matches/local/', MatchCreationView.as_view(), name='match-list'),
    path('match/online/create/', OnlineMatchCreationView.as_view(), name='match-create'),
    path('matches/local/<int:pk>/update-score/', MatchScoreUpdateView.as_view(), name='match-update-score'),
    #path('matches/local/<int:pk>/', MatchDetailView.as_view(), name='match-detail'),


#     # Tournaments
#     path('tournaments/', TournamentListCreateView.as_view(), name='tournament-list'),
#     path('tournaments/<int:pk>/', TournamentDetailView.as_view(), name='tournament-detail'),
#     path('tournaments/<int:pk>/matches/', TournamentMatchesView.as_view(), name='tournament-matches'),

    # User Stats
    #path('users/<int:user_id>/stats/', GoalStatView.as_view(), name='user-stats')]

    # path('user/matches-played/', MatchesPlayedView.as_view(), name='matches-played'),
    # path('user/matches-won/', MatchesWonView.as_view(), name='matches-won'),
    # path("tournament/", CreateTournamentView.as_view(), name="tournament"),
    # path("match/", CreateMatchView.as_view(), name="match")
]


