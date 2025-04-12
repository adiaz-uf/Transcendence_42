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

    def get(self, request):
        serializer = UserSerializer(request.user)  # Serialize user object
        return Response(serializer.data)  # Get serialized user object

    def patch(self, request):
        serializer = UserProfileUpdateSerializer(request.user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
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

        # Partidos donde el usuario jugó como player_left y ganó
        left_wins = Match.objects.filter(player_left=user, left_score__gt=F('right_score')).count()

        # Partidos donde el usuario jugó como player_right y ganó
        right_wins = Match.objects.filter(player_right=user, right_score__gt=F('left_score')).count()

        total_wins = left_wins + right_wins

        return Response({'username': username, 'matches_won': total_wins}, status=status.HTTP_200_OK)



class UploadProfileImageView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        user = request.user
        image = request.FILES.get('profile_image')

        if not image:
            return Response({'error': 'No image provided.'}, status=status.HTTP_400_BAD_REQUEST)

        user.profile_image = image
        user.save()
        return Response({'message': 'Profile image uploaded.'}, status=status.HTTP_200_OK)



class GetProfileImageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.profile_image:
            return Response({'profile_image_url': None}, status=status.HTTP_200_OK)

        return Response({'profile_image_url': request.build_absolute_uri(user.profile_image.url)})


class DeleteProfileImageView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        if user.profile_image:
            user.profile_image.delete(save=True)
            return Response({'message': 'Profile image deleted.'}, status=status.HTTP_200_OK)
        return Response({'error': 'No profile image to delete.'}, status=status.HTTP_404_NOT_FOUND)
