from rest_framework_simplejwt.views import TokenRefreshView
from api.serializer.auth.serializer import CustomTokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status

class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh')
        try:
            # Intentamos decodificar el refresh token
            token = RefreshToken(refresh_token)
            # Generamos un nuevo access token
            new_access_token = str(token.access_token)
            return Response({'access': new_access_token}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': 'Token no válido'}, status=status.HTTP_400_BAD_REQUEST)

