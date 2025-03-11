from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView, ProfileView, LoginView, Setup2FAView, MatchesPlayedView, MatchesWonView
from rest_framework_simplejwt.views import TokenRefreshView
from backend.websocket_consumers import PongConsumer

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/user/profile/", ProfileView.as_view(), name="profile"),
    path("api/token/", LoginView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api/setup-2fa/", Setup2FAView.as_view(), name="setup-2fa"),
    path("api-auth/", include("rest_framework.urls")),
    path("api/", include("api.urls")),
    path("ws/game/", PongConsumer.as_asgi()),
    path('api/user/matches-played/', MatchesPlayedView.as_view(), name='matches-played'),
    path('api/user/matches-won/', MatchesWonView.as_view(), name='matches-won'),
]
