from django.conf import settings
from django.contrib.auth import authenticate, login
from django.db import connection
from django.http import HttpResponseRedirect, JsonResponse
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django_otp.plugins.otp_totp.models import TOTPDevice
from io import BytesIO
import base64
import qrcode
import requests

from .models import Tournament, Match, UserProfile
from .serializers import (
    UserSerializer,
    TournamentSerializer,
    MatchSerializer,
    UserProfileUpdateSerializer,
)

class CreateUserView(generics.ListCreateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]  # Asegura que el usuario esté autenticado

    def get(self, request):
        user = request.user  # Obtiene el usuario autenticado
        serializer = UserSerializer(user)  # Serializa los datos del usuario
        return Response(serializer.data)  # Devuelve los datos serializados
    
class ProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        serializer = UserProfileUpdateSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CreateTournamentView(generics.CreateAPIView):
    serializer_class = TournamentSerializer
    queryset = Tournament.objects.all()
    permission_classes = [AllowAny]


class CreateMatchView(generics.CreateAPIView):
    serializer_class = MatchSerializer
    queryset = Match.objects.all()
    permission_classes = [AllowAny]

class MatchesPlayedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Definir la consulta SQL
        query = """
            SELECT COUNT(*)
            FROM match m
            JOIN team t1 ON m.team_left_id = t1.id
            JOIN team t2 ON m.team_right_id = t2.id
            WHERE t1.player1_id_id = %s OR t1.player2_id_id = %s
            OR t2.player1_id_id = %s OR t2.player2_id_id = %s;
        """
        with connection.cursor() as cursor:
            cursor.execute(query, [user.id, user.id, user.id, user.id])
            result = cursor.fetchone()  
        
        return Response({"matches_played": result[0]})

class MatchesWonView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Definir la consulta SQL para contar los partidos ganados por el usuario
        query = """
            SELECT COUNT(*)
            FROM match m
            JOIN team t1 ON m.team_left_id = t1.id
            JOIN team t2 ON m.team_right_id = t2.id
            WHERE (
                (t1.player1_id_id = %s OR t1.player2_id_id = %s)
                AND m.left_score > m.right_score
            ) 
            OR
            (
                (t2.player1_id_id = %s OR t2.player2_id_id = %s)
                AND m.right_score > m.left_score
            );
        """
        with connection.cursor() as cursor:
            cursor.execute(query, [user.id, user.id, user.id, user.id])
            result = cursor.fetchone()
        
        return Response({"matches_won": result[0] if result[0] is not None else 0})

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            if user.is_2fa_enabled:
                code = request.data.get('code')
                if code:
                    device = TOTPDevice.objects.filter(user=user, name='default').first()
                    if device and device.verify_token(code):
                        refresh = RefreshToken.for_user(user)
                        return Response({
                            'refresh': str(refresh),
                            'access': str(refresh.access_token),
                        })
                    return Response({'error': 'Code 2FA invalide'}, status=400)
                return Response({'message': 'Code 2FA requis'}, status=206)
            else:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                })
        return Response({'error': 'Identifiants invalides'}, status=401)


class Setup2FAView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        device = TOTPDevice.objects.filter(user=user, name='default').first()
        if not device:
            device = TOTPDevice.objects.create(user=user, name='default')
            user.totp_secret = base64.b32encode(device.bin_key).decode('utf-8').rstrip('=')
            user.save()

        totp_uri = device.config_url
        qr = qrcode.QRCode()
        qr.add_data(totp_uri)
        qr.make(fit=True)
        img = qr.make_image(fill='black', back_color='white')
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        img_str = base64.b64encode(buffer.getvalue()).decode('utf-8')

        return Response({
            'qr_code': f'data:image/png;base64,{img_str}',
            'secret': base64.b32encode(device.bin_key).decode('utf-8'),
            'is_2fa_enabled': user.is_2fa_enabled  # Added to inform the frontend
        })

    def post(self, request):
        user = request.user
        code = request.data.get('code')
        disable = request.data.get('disable', False)  # New parameter to disable

        device = TOTPDevice.objects.filter(user=user, name='default').first()
        if not device:
            return Response({'error': 'No 2FA device found'}, status=400)

        if disable:
            if device.verify_token(code):
                user.is_2fa_enabled = False
                user.save()
                return Response({'message': '2FA successfully disabled'})
            return Response({'error': 'Invalid code for deactivation'}, status=400)
        else:
            if device.verify_token(code):
                user.is_2fa_enabled = True
                user.save()
                return Response({'message': '2FA successfully enabled'})
            return Response({'error': 'Invalid code for activation'}, status=400)


def get_or_create_user(user_data):
    """Crée ou récupère un utilisateur à partir des données de 42."""
    username = user_data['login']
    email = user_data['email']
    user, created = UserProfile.objects.get_or_create(
        username=username,
        defaults={
            'email': email,
            'given_name': user_data['displayname'].split()[0],
            'surname': ' '.join(user_data['displayname'].split()[1:]) or '',
        }
    )
    return user


class FTAuthCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.GET.get('code')
        state = request.GET.get('state')

        if not code:
            return JsonResponse({'error': 'No code provided'}, status=400)

        if not state:
            return JsonResponse({'error': 'Missing state parameter'}, status=400)

        # Échange du code contre un access_token
        token_url = "https://api.intra.42.fr/oauth/token"
        payload = {
            'grant_type': 'authorization_code',
            'client_id': settings.FT_CLIENT_ID,
            'client_secret': settings.FT_CLIENT_SECRET,
            'code': code,
            'redirect_uri': settings.FT_REDIRECT_URI,
        }
        response = requests.post(token_url, data=payload)
        if response.status_code != 200:
            return JsonResponse({'error': 'Failed to get access token'}, status=500)

        token_data = response.json()
        access_token = token_data.get('access_token')

        # Récupération des infos utilisateur
        user_info_url = "https://api.intra.42.fr/v2/me"
        headers = {'Authorization': f'Bearer {access_token}'}
        user_response = requests.get(user_info_url, headers=headers)
        if user_response.status_code != 200:
            return JsonResponse({'error': 'Failed to get user info'}, status=500)

        user_data = user_response.json()
        user = get_or_create_user(user_data)

        # Connexion de l'utilisateur
        login(request, user)
        refresh = RefreshToken.for_user(user)

        # Redirection vers le frontend
        return HttpResponseRedirect(
            f"https://transcendence.local/login/callback?access={refresh.access_token}"
        )
