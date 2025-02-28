from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView, CreateTournamentView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from backend.websocket_consumers import PongConsumer

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/user/register/", CreateTournamentView.as_view(), name="tournament"),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    path("api/", include("api.urls")),
    path("ws/game/", PongConsumer.as_asgi()),
]
