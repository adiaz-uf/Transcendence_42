from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView

from api.views.user.views import CreateUserView, UserProfileView, LoginView, CheckUserExistsView
from api.views.match.views import MatchCreationView, UserMatchListView, MatchScoreUpdateView
from api.views.auth.TwoFA import Setup2FAView
from api.views.auth.auth42 import FTAuthCallbackView
from api.views.tournament.views import CreateTournamentView

urlpatterns = [

    path("user/login/", LoginView.as_view(), name='login'), #POST
    path("user/register/", CreateUserView.as_view(), name='register'), #POST
    path("user/profile/", UserProfileView.as_view(), name='profile'), #UPDT & GET
    path("user/refresh/", TokenRefreshView.as_view(), name='refresh'), #GET?
    path("user/<str:username>", CheckUserExistsView.as_view(), name="check_username"),#GET
    #path('user/<int:user_id>/stats/', GoalStatView.as_view(), name='user-stats')]
    # path('user/matches-played/', MatchesPlayedView.as_view(), name='matches-played'),
    # path('user/matches-won/', MatchesWonView.as_view(), name='matches-won'),

    path("setup-2fa/", Setup2FAView.as_view(), name='setup2fa'),# GET & POST
    path("auth/42/callback/", FTAuthCallbackView.as_view(), name='ft_callback'), #GET

    path('matches/local/', MatchCreationView.as_view(), name='match-create'), #POST
    #Updates Matches scores and duration
    path('matches/local/<uuid:pk>', MatchScoreUpdateView.as_view(), name='match-update'),#UPDT
    # Can specify match-id or list all user matches
    path('matches/local/list', UserMatchListView.as_view(), name="list-match") ,# GET
    
    path("tournament/", CreateTournamentView.as_view(), name="tournament"),
#   path('tournaments/<int:pk>/', TournamentDetailView.as_view(), name='tournament-detail'),
#   path('tournaments/<int:pk>/matches/', TournamentMatchesView.as_view(), name='tournament-matches'),
]


