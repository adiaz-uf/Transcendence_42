from django.contrib.auth import authenticate, login
from rest_framework import generics, status
from rest_framework.views import APIView

from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication

from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django_otp.plugins.otp_totp.models import TOTPDevice

import logging
logger = logging.getLogger('django')

from api.models import UserProfile
from api.serializer.user.serializer import (UserSerializer, UserProfileUpdateSerializer, FriendSerializer)


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
            # Verifica si el usuario existe en la base de datos
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
                    return Response({'error': 'Invalide 2FA code'}, status=400)
                return Response({'message': '2FA code is required'}, status=206)
            else:
                login(request, user)
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'id': user.id
                })
        return Response({'error': 'Invalid identifiers'}, status=401)
