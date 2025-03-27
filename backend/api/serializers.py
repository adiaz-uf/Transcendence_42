from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from .models import UserProfile, Tournament, Match, GoalStat


CurrentUser = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
#These are all the fields which will be serialized when accepting and/or returning a user
        fields = [ 
            "id",
            "email", 
            "username", 
            "last_active",
            "password",
            "is_42user",
            "is_2fa_enabled",
            "totp_secret"]
        extra_kwargs = {"password": {"write_only": True}}       #Write only means this field wont be returned and cant be read be users
        
    def create(self, validated_data):                           #This will be called when creaing a user. validated data is sent via JSON and contains the fields created above
        user = UserProfile.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            email=validated_data.get("email", ""),
            is_42user=validated_data.get("is_42user", False)
        )       #This data is then stored in a user and returned, this def is created in CustomUserManager
        return user

# Secondary Representation of UserProfile 
class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurrentUser
        fields = ["email", "username", "password"]
        extra_kwargs = {
            "password": {"write_only": True, "required": False},  # Password shouldn't be readable
            "email": {"required": False},
            "username": {"required": False},
        }

    def validate_password(self, value):
        """Ensure password is strong enough (optional)."""
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        return value

    def update(self, instance, validated_data):
        """Update user profile details safely."""
        
        # Update fields if provided
        if "email" in validated_data:
            instance.email = validated_data["email"]

        if "username" in validated_data:
            instance.username = validated_data["username"]

        if "password" in validated_data:
            instance.password = make_password(validated_data["password"])  # Hash the password
        
        instance.save()  # Save the updated instance
        return instance


# Tournament Serializer with nested relationships
class TournamentSerializer(serializers.ModelSerializer):
    matches = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Match.objects.all(), 
        required=False
    )
    class Meta:
        model = Tournament
        fields = '__all__'

# Match Serializer
class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = '__all__'

# Goal Statistics Serializer
class UserStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStat
        fields = '__all__'

        
