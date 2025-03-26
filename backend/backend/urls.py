from django.contrib import admin
from django.urls import path, include
from backend.websocket_consumers import PongConsumer

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api-auth/", include("rest_framework.urls")),
    path("api/", include("api.urls")),
]
