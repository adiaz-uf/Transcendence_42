from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/", include("api.urls")),
    
    #path("ws/game/", PongConsumer.as_asgi()) set in asgi.py but here to remember!
]

