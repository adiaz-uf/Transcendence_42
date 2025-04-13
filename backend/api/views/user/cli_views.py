from rest_framework.parsers import MultiPartParser, FormParser

class UserProfileView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    
    def get(self, request):
        try:
            user = request.user
            if not user:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            profile_data = {
                "username": user.username,
                "email": user.email,
                "given_name": user.given_name,
                "surname": user.surname,
                "avatar": user.avatar.url if user.avatar else None
            }
            return Response(profile_data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request):
        try:
            user = request.user
            if not user:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

            # Handle avatar upload
            if 'avatar' in request.FILES:
                user.avatar = request.FILES['avatar']
                user.save()
                return Response({
                    "message": "Avatar updated successfully",
                    "avatar_url": user.avatar.url
                })

            # Handle other profile updates
            if 'username' in request.data:
                user.username = request.data['username']
            if 'email' in request.data:
                user.email = request.data['email']
            if 'given_name' in request.data:
                user.given_name = request.data['given_name']
            if 'surname' in request.data:
                user.surname = request.data['surname']
            
            user.save()
            return Response({"message": "Profile updated successfully"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 