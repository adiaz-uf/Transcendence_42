from rest_framework_simplejwt.views import TokenRefreshView
from api.serializer.auth.serializer import CustomTokenRefreshSerializer

class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer
