from django.contrib.auth import authenticate
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django_otp.plugins.otp_totp.models import TOTPDevice
from io import BytesIO
import base64
import qrcode

from .models import Note, Tournament, Match, UserProfile
from .serializers import (
    UserSerializer,
    NoteSerializer,
    TournamentSerializer,
    MatchSerializer,
    UserProfileUpdateSerializer,
)

class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)

class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

#class CreateUserView(generics.CreateAPIView):
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

# Create your views here.

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
