from django.conf import settings
from django.contrib.auth import authenticate, login
from django.db import connection
from django.http import HttpResponseRedirect, JsonResponse
from rest_framework import generics, status

from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django_otp.plugins.otp_totp.models import TOTPDevice
from io import BytesIO
from django.shortcuts import get_object_or_404
import json
import json
import base64
import qrcode
import requests
import logging

logger = logging.getLogger(__name__)

# DB TABLES
from .models import (
    Tournament, 
    Match, 
    UserProfile,
    UserStat)

# TABLES SERIALIZERS
import logging

logger = logging.getLogger(__name__)

from .models import Tournament, Match, UserProfile
from .serializers import (
    UserSerializer,
    UserProfileUpdateSerializer,

    TournamentSerializer,
    MatchSerializer,
    UserStatSerializer,
)


#CLASS BASED VIEWS: (Remember List)
# CreateAPIView (POST only)
# ListAPIView (GET only)
# RetrieveAPIView (GET single object)
# UpdateAPIView (PUT/PATCH only)
# DestroyAPIView (DELETE only)
# ListCreateAPIView (GET + POST)
# RetrieveUpdateAPIView (GET + PUT/PATCH)
# RetrieveDestroyAPIView (GET + DELETE)
# RetrieveUpdateDestroyAPIView (GET + PUT/PATCH + DELETE)
# ViewSets (for automatic URL routing): ViewSet, ModelViewSet, ReadOnlyModelViewSet

#Main diff between this confusing 3 requests.
# Method | Purpose	                  Updates Existing?	 Creates New?	Replaces Entire Object?	Partial Update?
# POST	 | Create a new resource	        ❌ No	    ✅ Yes	        ❌ No	            ❌ No
# PUT	 | Fully update/replace a resource	✅ Yes	    ✅ Yes (if ID not required)✅ Yes	    ❌ No
# PATCH	 | Partially update a resource 	    ✅ Yes	    ❌ No	        ❌ No	            ✅ Yes

#    For more info about Objects in Django, i recomnend
# python3 manage.py shell
# from rest_framework import generics, serializers, permissions, authentication, views

# print(dir(generics))  # Lists all generic views
# print(dir(serializers))  # Lists all serializer classes
# print(dir(permissions))  # Lists all permission classes
# print(dir(authentication))  # Lists authentication classes
# print(dir(views))  # Lists APIView and related base classes



#------------------------------ USER VIEWS (with output serializers from model) --------------------------

# REGISTER VIEW: for registering process
#   model: UserProfile 
#   serializer: Userserializer
class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

# UPDATE Profile VIEW:  for modifying account
#   model: UserProfile 
#   serializer: UserProfileUpdateSerializer


class ProfileView(APIView):
    authentication_classes = [JWTAuthentication]  # Ensures JWT is used
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  # Get the authentified user
        serializer = UserSerializer(user)  # Serialize user object
        return Response(serializer.data)  # Get serialized user object

    def patch(self, request):
        user = request.user
        serializer = UserProfileUpdateSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
# LOGIN VIEW: for logging into the account
#   model: UserProfile 
#   serializer: Userserializer
class LoginView(generics.CreateAPIView):
    serializer_class = UserSerializer
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
                        login(request, user)
                        return Response({
                            'refresh': str(refresh),
                            'access': str(refresh.access_token),
                            'id': str(id),
                        })
                    return Response({'error': 'Code 2FA invalide'}, status=400)
                return Response({'message': 'Code 2FA requis'}, status=206)
            else:
                login(request, user)
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                })
        return Response({'error': 'Identifiants invalides'}, status=401)

#------------------------------------MAtches views -----------------------------------------

# CreateAPIView (POST only)
# ListAPIView (GET only)
# RetrieveAPIView (GET single object)
# UpdateAPIView (PUT/PATCH only)
# DestroyAPIView (DELETE only)
# ListCreateAPIView (GET + POST)
# RetrieveUpdateAPIView (GET + PUT/PATCH)
# RetrieveDestroyAPIView (GET + DELETE)
# RetrieveUpdateDestroyAPIView (GET + PUT/PATCH + DELETE)

class MatchCreationView(generics.CreateAPIView):
    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """
        Override perform_create to set the match host (player_left).
        """
        # Save the match
        serializer.save(player_left=None,
                        player_right=None,
                        match_duration=0, 
                        left_score=0,
                        right_score=0)

class MatchScoreUpdateView(generics.UpdateAPIView):
    """
    Updates only the match score.
    """
    queryset = Match.objects.all() # Allow to use primary key on Url
    serializer_class = MatchSerializer

    def update(self, request, *args, **kwargs):
        """
        Override update method to restrict updates to only scores.
        """
        match = self.get_object()  # Fetch the match instance
        data = request.data  # Get request data

        # Allow updating only score fields
        match.left_score = data.get("left_score", match.left_score)
        match.right_score = data.get("right_score", match.right_score)
        match.save()

        return Response(
            {"message": "Scores updated successfully!", "match": MatchSerializer(match).data},
            status=status.HTTP_200_OK
        )
    
class UserMatchListView(generics.ListAPIView):
    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Returns all matches linked to the authenticated user.
        """
        return Match.objects.filter(
            player_left=self.request.user
        ) | Match.objects.filter(
            player_right=self.request.user
        )


class AvailableMatchView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MatchSerializer

    def get_queryset(self):
        return Match.objects.filter(is_multiplayer=True, is_started=False, )


    
# class MatchesPlayedView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         user = request.user

#         # Definir la consulta SQL
#         query = """
#             SELECT COUNT(*)
#             FROM match m
#             JOIN team t1 ON m.team_left_id = t1.id
#             JOIN team t2 ON m.team_right_id = t2.id
#             WHERE t1.player1_id_id = %s OR t1.player2_id_id = %s
#             OR t2.player1_id_id = %s OR t2.player2_id_id = %s;
#         """
#         with connection.cursor() as cursor:
#             cursor.execute(query, [user.id, user.id, user.id, user.id])
#             result = cursor.fetchone()  
        
#         return Response({"matches_played": result[0]})

# class MatchesWonView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         user = request.user

#         # Definir la consulta SQL para contar los partidos ganados por el usuario
#         query = """
#             SELECT COUNT(*)
#             FROM match m
#             JOIN team t1 ON m.team_left_id = t1.id
#             JOIN team t2 ON m.team_right_id = t2.id
#             WHERE (
#                 (t1.player1_id_id = %s OR t1.player2_id_id = %s)
#                 AND m.left_score > m.right_score
#             ) 
#             OR
#             (
#                 (t2.player1_id_id = %s OR t2.player2_id_id = %s)
#                 AND m.right_score > m.left_score
#             );
#         """
#         with connection.cursor() as cursor:
#             cursor.execute(query, [user.id, user.id, user.id, user.id])
#             result = cursor.fetchone()
        
#         return Response({"matches_won": result[0] if result[0] is not None else 0})

# ---------------------------------------------- Tournaments --------------------------------------------------------------



class CreateTournamentView(generics.CreateAPIView):
    serializer_class = TournamentSerializer
    queryset = Tournament.objects.all()
    permission_classes = [AllowAny]

class CreateMatchView(generics.CreateAPIView):
    serializer_class = MatchSerializer
    queryset = Match.objects.all()
    permission_classes = [AllowAny]


# ---------------------------------------------- Stats --------------------------------------------------------------


# ---------------------------------------------- 2FA --------------------------------------------------------------

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





# ---------------------------------------------- 42 api for auth --------------------------------------------------------------


def get_or_create_user(user_data):
    """Create or get a user from 42 database."""
    print("Received user_data from 42: ", user_data)
    username = user_data['login']
    email = user_data['email']
    user, created = UserProfile.objects.get_or_create(
        username=username,
        defaults={
            'email': email,
            'is_42user': True,
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

        state_data = json.loads(state)
        redirect_uri = state_data.get('redirect_uri')
        logger.info(f"Retrieved redirect_uri from state: {redirect_uri}")

        token_url = "https://api.intra.42.fr/oauth/token"
        payload = {
            'grant_type': 'authorization_code',
            'client_id': settings.FT_CLIENT_ID,
            'client_secret': settings.FT_CLIENT_SECRET,
            'code': code,
            'redirect_uri': redirect_uri,
        }

        response = requests.post(token_url, data=payload)
        if response.status_code != 200:
            logger.error(f"Token request failed: {response.status_code} - {response.text}")
            logger.info(f"Sent payload: {payload}")
            return JsonResponse({'error': 'Failed to get access token', 'details': response.text}, status=500)

        token_data = response.json()
        access_token = token_data.get('access_token')

        # Get user info
        user_info_url = "https://api.intra.42.fr/v2/me"
        headers = {'Authorization': f'Bearer {access_token}'}
        user_response = requests.get(user_info_url, headers=headers)
        if user_response.status_code != 200:
            return JsonResponse({'error': 'Failed to get user info'}, status=500)

        user_data = user_response.json()
        user = get_or_create_user(user_data)

        # Connect user
        login(request, user)
        refresh = RefreshToken.for_user(user)

        # Redirect to frontend
        callback_uri = redirect_uri.replace('/api/auth/42/callback', '/login/callback')
        redirect_url = f"{callback_uri}?access={refresh.access_token}"
        logger.info(f"Redirecting to: {redirect_url}")
        return HttpResponseRedirect(redirect_url)

class CheckUsernameView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username, format=None):
        try:
            # Verifica si el usuario existe en la base de datos
            user = UserProfile.objects.get(username=username)
            return Response({"exists": True}, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response({"exists": False}, status=status.HTTP_404_NOT_FOUND)
