from django.conf import settings
from django.http import HttpResponseRedirect, JsonResponse
from django.contrib.auth import authenticate, login
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

import json
import base64
import qrcode
import requests

import logging
logger = logging.getLogger(__name__)

# DB TABLES
from api.models import UserProfile

logger = logging.getLogger(__name__)


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
            'username': user_data['login']
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