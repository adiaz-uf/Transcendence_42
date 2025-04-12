from rest_framework import serializers
from api.models import UserProfile

class FriendSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "active",
            "username", 
]

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [ 
            "id",
            "email", 
            "username", 
            "given_name", 
            "surname",
            "password",
            "is_42user",
            "friends",
            "is_2fa_enabled",
            "totp_secret",
            "avatar"]
        extra_kwargs = {"password": {"write_only": True}}       #Write only means this field wont be returned and cant be read be users
        
    def create(self, validated_data):                       
        user = UserProfile.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            email=validated_data.get("email", ""),
            given_name=validated_data.get("given_name", ""),
            surname=validated_data.get("surname", ""),
            is_42user=validated_data.get("is_42user", False)
        )       #This data is then stored in a user and returned, this def is created in CustomUserManager
        return user

# Secondary Representation of UserProfile
class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["email", "username", "given_name", "surname", "password", "friends", "avatar"]
        extra_kwargs = {
            "email": {"required": False},
            "username": {"required": False},
            "given_name": {"required": False},
            "surname": {"required": False},
            "password": {"write_only": True, "required": False},  # Password shouldn't be readable
            "avatar": {"required": False},
        }

    def update(self, instance, validated_data):
        """Update user profile details safely."""

        if not isinstance(instance, UserProfile):
            raise TypeError("Expected a UserProfile instance")

        password = validated_data.pop('password', None)
        avatar = validated_data.pop('avatar', None)

        for key in self.Meta.fields:
            if key in validated_data:
                setattr(instance, key, validated_data[key])

        if password:  # Hash password before saving
            instance.set_password(password)
        
        if avatar:  # Handle avatar upload
            instance.avatar = avatar

        instance.save()
        return instance

