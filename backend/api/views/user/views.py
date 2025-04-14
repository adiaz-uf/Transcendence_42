from django.contrib.auth import authenticate, login
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication

from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django_otp.plugins.otp_totp.models import TOTPDevice

import logging
logger = logging.getLogger('django')

from api.models import UserProfile, Match
from api.serializer.user.serializer import (UserSerializer, UserProfileUpdateSerializer, FriendSerializer)
from api.serializer.match.serializer import (MatchSerializer)


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
# Todo: make a RetrieveUpdateAPIView
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        serializer = UserSerializer(request.user)  # Serialize user object
        return Response(serializer.data)  # Get serialized user object

    def patch(self, request):
        serializer = UserProfileUpdateSerializer(request.user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            # Get the updated user data
            updated_serializer = UserSerializer(request.user)
            return Response(updated_serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OthersProfileView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, username):
        """Retrieve the user profile object."""
        try:
            return UserProfile.objects.get(username=username)
        except UserProfile.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    def get(self, request, username):
        user = self.get_object(username)
        serializer = UserSerializer(user)  # Serialize user object
        return Response(serializer.data)  # Get serialized user object


#Handles Authenticated User Activeness
class UserActiveView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        # Check if the user is active
        if user.active:
            return Response({"active": True}, status=status.HTTP_200_OK)
        else:
            return Response({"active": False}, status=status.HTTP_200_OK)
    def patch(self, request):
        user = request.user
        # Update the user's active status
        user.active = self.request.data.get('active', False)  # Default to False if not provided
        user.save(update_fields=['active'])
        return Response({"message": "User activated successfully."}, status=status.HTTP_200_OK)
# gets Others User Activeness
class OthersActiveView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, username):
        """Retrieve the user profile object."""
        try:
            return UserProfile.objects.get(username=username)
        except UserProfile.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    def get(self, request, username):
        user =  self.get_object(username) # Retrieve user object
        # Check if the user is active
        if user.active:
            return Response({"active": True}, status=status.HTTP_200_OK)
        else:
            return Response({"active": False}, status=status.HTTP_200_OK)

from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.utils import timezone

# HardCoded Logout for sendBeacon method (Invoked at closing tab)
class BeaconLogoutView(APIView):
    authentication_classes = []  # Disable DRF authentication here
    permission_classes = []      # Open access (manually handle auth)

    def post(self, request):
        token = request.GET.get("token")
        active = request.GET.get("active", "false").lower() == "true"

        if not token:
            return Response({"error": "No token provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validated_token = UntypedToken(token)
            logger.info("Validated token:")
            logger.info(validated_token)
            user_id = validated_token['user_id']
            user = UserProfile.objects.get(id=user_id)
        except (TokenError, UserProfile.DoesNotExist, KeyError):
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

        user.active = active
        user.last_active = timezone.now()
        user.save(update_fields=["active", "last_active"])

        return Response({"message": "User status updated"}, status=status.HTTP_200_OK)


class UserFriendsView(APIView):
    permission_classes = [IsAuthenticated]
    def get_object(self, username):
        """Retrieve the user profile object."""
        try:
            return UserProfile.objects.get(username=username)
        except UserProfile.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    def get(self, request, username):
        user = self.get_object(username)  # Retrieve user object
        friends = user.friends.all() #get friends
        logger.info(friends)  # Logs the queryset of friends
        if not friends.exists():
            return Response({}, status=status.HTTP_200_OK)
        serializer = FriendSerializer(friends, many=True)  # Serialize friends array
        return Response(serializer.data, status=status.HTTP_200_OK)  # send serialized array

    def post(self, request, username=False):
        """Add a friend to the authenticated user's friend list."""
        user = request.user
        try:
            friend = self.get_object(username)
            if friend == user:
                return Response({"error": "You cannot add yourself as a friend."}, status=status.HTTP_400_BAD_REQUEST)
            if user.friends.filter(id=friend.id).exists():
                return Response({"error": "You are already friends with this user."}, status=status.HTTP_409_CONFLICT)
            user.friends.add(friend)
            return Response({"message": "Friend added successfully."}, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, username=False):
        """Remove a friend from the authenticated user's friend list."""
        user = request.user
        try:
            friend = self.get_object(username)
            user.friends.remove(friend)
            return Response({"message": "Friend removed successfully."}, status=status.HTTP_200_OK)

        except UserProfile.DoesNotExist:
            return Response({"error": "bruh User not found."}, status=status.HTTP_404_NOT_FOUND)

class CheckUserExistsView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username, format=None):
        try:
            user = UserProfile.objects.get(username=username)

            # Devuelve la información del usuario junto con "exists: True"
            return Response({
                "exists": True,
                "userProfile": {
                    "id": str(user.id),
                    "username": user.username,
                    "given_name": user.given_name,
                    "surname": user.surname,
                    "email": user.email
                }
            }, status=status.HTTP_200_OK)
        
        except UserProfile.DoesNotExist:
            return Response({"exists": False}, status=status.HTTP_404_NOT_FOUND)


# LOGIN VIEW: for logging into the account
#   model: UserProfile 
#   serializer: Userserializer
class LoginView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


    def __RefreshToken_And_ActiveFieldOnDB(self, user):
        refresh = RefreshToken.for_user(user)    
        user.active = True
        user.save(update_fields=['active'])
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'id': user.id
        }

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
                        login(request, user)
                        return Response(self.__RefreshToken_And_ActiveFieldOnDB(user))
                    return Response({'error': 'Invalide 2FA code'}, status=400)
                return Response({'message': '2FA code is required'}, status=206)
            else:
                login(request, user)
                return Response(self.__RefreshToken_And_ActiveFieldOnDB(user))
        return Response({'error': 'Invalid identifiers'}, status=401)

class MatchesPlayedView(APIView):
    def get(self, request, username):
        user = UserProfile.objects.get(username=username)

        played_as_left = Match.objects.filter(player_left=user).count()
        played_as_right = Match.objects.filter(player_right=user).count()

        total_played = played_as_left + played_as_right

        return Response({'username': username, 'matches_played': total_played}, status=status.HTTP_200_OK)
    
from django.db.models import F

class MatchesWonView(APIView):
    def get(self, request, username):
        user = UserProfile.objects.get(username=username)

        left_wins = Match.objects.filter(player_left=user, left_score__gt=F('right_score')).count()

        right_wins = Match.objects.filter(player_right=user, right_score__gt=F('left_score')).count()

        total_wins = left_wins + right_wins

        return Response({'username': username, 'matches_won': total_wins}, status=status.HTTP_200_OK)
    
class UserListMatchesView(APIView):
    def get(self, request, username, format=None):
        try:
            user = UserProfile.objects.get(username=username)
        except UserProfile.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        matches = Match.objects.filter(player_left=user) | Match.objects.filter(player_right=user)

        match_data = []
        for match in matches:
            serialized_match  = MatchSerializer(match).data

            if match.left_score > match.right_score:
                result = 'won' if match.player_left == user else 'lost'
            else:
                result = 'lost' if match.player_left == user else 'won'

            match_data.append({
                'result': result,
                'match': serialized_match
            })

        match_data = sorted(match_data, key=lambda x: x['match']['date'], reverse=True)

        return Response({'matches': match_data}, status=status.HTTP_200_OK)