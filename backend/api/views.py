from django.conf import settings
from django.contrib.auth import authenticate, login
from django.db import connection, transaction
from django.http import HttpResponseRedirect, JsonResponse
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django_otp.plugins.otp_totp.models import TOTPDevice
from io import BytesIO
from web3 import Web3
import json
import base64
import qrcode
import requests
import logging


from .models import Tournament, Match, UserProfile, Team
from .serializers import (
    UserSerializer,
    TournamentSerializer,
    TeamSerializer,
    MatchSerializer,
    UserProfileUpdateSerializer,
)

logger = logging.getLogger(__name__)

# Vue pour créer et lister les utilisateurs
class CreateUserView(generics.ListCreateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

# Vue pour obtenir le profil de l'utilisateur authentifié
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

# Vue pour mettre à jour le profil de l'utilisateur
class ProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        serializer = UserProfileUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Vue pour la connexion
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

# Vue pour configurer le 2FA
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
            'is_2fa_enabled': user.is_2fa_enabled
        })

    def post(self, request):
        user = request.user
        code = request.data.get('code')
        disable = request.data.get('disable', False)

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

# Fonction pour obtenir ou créer un utilisateur à partir des données de 42
def get_or_create_user(user_data):
    username = user_data['login']
    email = user_data['email']
    user, created = UserProfile.objects.get_or_create(
        username=username,
        defaults={
            'email': email,
            'given_name': user_data['displayname'].split()[0],
            'surname': ' '.join(user_data['displayname'].split()[1:]) or '',
            'is_42user': True,
        }
    )
    return user

# Vue pour le callback d'authentification 42
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

        user_info_url = "https://api.intra.42.fr/v2/me"
        headers = {'Authorization': f'Bearer {access_token}'}
        user_response = requests.get(user_info_url, headers=headers)
        if user_response.status_code != 200:
            return JsonResponse({'error': 'Failed to get user info'}, status=500)

        user_data = user_response.json()
        user = get_or_create_user(user_data)

        login(request, user)
        refresh = RefreshToken.for_user(user)

        callback_uri = redirect_uri.replace('/api/auth/42/callback', '/login/callback')
        redirect_url = f"{callback_uri}?access={refresh.access_token}"
        logger.info(f"Redirecting to: {redirect_url}")
        return HttpResponseRedirect(redirect_url)

# Initialisation Web3 pour la blockchain
w3 = Web3(Web3.HTTPProvider(settings.ETHEREUM_PROVIDER_URL))

contract_abi = json.loads('''[
    {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
    {"inputs":[{"internalType":"uint256","name":"tournamentId","type":"uint256"},{"internalType":"uint256","name":"scoreLeft","type":"uint256"},{"internalType":"uint256","name":"scoreRight","type":"uint256"}],"name":"addScore","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"tournamentId","type":"uint256"}],"name":"getScores","outputs":[{"components":[{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"scoreLeft","type":"uint256"},{"internalType":"uint256","name":"scoreRight","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"internalType":"struct TournamentScores.Score[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"}
]''')

contract = w3.eth.contract(
    address=Web3.to_checksum_address(settings.ETHEREUM_CONTRACT_ADDRESS),
    abi=contract_abi
)

# Fonction pour envoyer les scores à la blockchain
def send_score_to_blockchain(tournament_id, score_left, score_right):
    try:
        account = w3.eth.account.from_key(settings.ETHEREUM_PRIVATE_KEY)
        nonce = w3.eth.get_transaction_count(account.address)
        tx = contract.functions.addScore(tournament_id, score_left, score_right).build_transaction({
            'from': account.address,
            'nonce': nonce,
            'gas': contract.functions.addScore().estimate_gas(),
            'gasPrice': w3.eth.gas_price,
        })
        signed_tx = account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        logger.info(f"Score added to blockchain: {tx_hash.hex()}")
    except Exception as e:
        logger.error(f"Blockchain error: {str(e)}")
        raise


# NEW
class TournamentListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        tournaments = Tournament.objects.all()
        serializer = TournamentSerializer(tournaments, many=True)
        return Response(serializer.data)

class TournamentCreateView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = TournamentSerializer(data=request.data)
        if serializer.is_valid():
            tournament = serializer.save()
            return Response({"id": tournament.id, "name": tournament.name}, status=201)
        return Response(serializer.errors, status=400)

class AddTeamsView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, tournament_id):
        tournament = Tournament.objects.get(id=tournament_id)
        team_ids = request.data.get("team_ids", [])
        for team_id in team_ids:
            team = Team.objects.get(id=team_id)
            team.tournament = tournament
            team.save()
        return Response({"message": "Teams added"}, status=200)

class GenerateMatchesView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, tournament_id):
        tournament = Tournament.objects.get(id=tournament_id)
        teams = list(tournament.teams.all())
        if len(teams) < 2:
            return Response({"error": "Not enough teams"}, status=400)
        for i in range(0, len(teams) - 1, 2):
            Match.objects.create(tournament=tournament, team_left=teams[i], team_right=teams[i + 1])
        return Response({"message": "Matches generated"}, status=200)

class TournamentDetailView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, tournament_id):
        tournament = Tournament.objects.get(id=tournament_id)
        serializer = TournamentSerializer(tournament)
        return Response(serializer.data)

class MatchListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        tournament_id = request.query_params.get('tournament_id')
        matches = Match.objects.filter(tournament_id=tournament_id)
        serializer = MatchSerializer(matches, many=True)
        return Response(serializer.data)


# Vue pour lister et créer des équipes
class TeamListCreateView(generics.ListCreateAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        if 'player1_id' not in self.request.data or not self.request.data['player1_id']:
            default_user = UserProfile.objects.get(id=1)
            serializer.save(player1_id=default_user)
        else:
            serializer.save()

# Vue pour créer un match
class CreateMatchView(generics.CreateAPIView):
    serializer_class = MatchSerializer
    queryset = Match.objects.all()
    permission_classes = [AllowAny]


# Vue pour obtenir le nombre de matchs joués par l'utilisateur
class MatchesPlayedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
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

# Vue pour obtenir les scores d'un tournoi depuis la blockchain
class GetTournamentScoresView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, tournament_id):
        try:
            scores = contract.functions.getScores(tournament_id).call()
            return Response({"scores": scores})
        except Exception as e:
            logger.error(f"Error fetching scores: {str(e)}")
            return Response({"error": "Failed to fetch scores"}, status=500)

# Vue pour obtenir le nombre de matchs gagnés par l'utilisateur
class MatchesWonView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
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

# Vue pour mettre à jour les scores d'un match et les envoyer à la blockchain
class UpdateMatchScoresView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        match_id = request.data.get("match_id")
        left_score = request.data.get("left_score")
        right_score = request.data.get("right_score")

        if not all([match_id, left_score is not None, right_score is not None]):
            return Response({"error": "Missing match_id, left_score, or right_score"}, status=400)

        try:
            match = Match.objects.get(id=match_id)
            match.left_score = left_score
            match.right_score = right_score
            match.save()

            if match.tournament_id:
                send_score_to_blockchain(match.tournament_id.id, left_score, right_score)
            return Response({"status": "Scores updated and sent to blockchain"})
        except Match.DoesNotExist:
            return Response({"error": "Match not found"}, status=404)
        except Exception as e:
            logger.error(f"Error updating scores: {str(e)}")
            return Response({"error": "Failed to update scores"}, status=500)

class UserListView(generics.ListAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
