from rest_framework import serializers
from .models import UserProfile, Tournament, Match, UserStat

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
#These are all the fields which will be serialized when accepting and/or returning a user
        fields = [ 
            "id"
            "email", 
            "username", 
            "last_active",
            "password",
            "localmatches",
            "onlinematches",
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
        model = UserProfile
        fields = ["email", "username", "password"]

    def update(self, instance, validated_data):
        email = validated_data.pop('email', None)
        username = validated_data.pop('username', None)
        password = validated_data.pop('password', None)

        # If password, we modify it
        if password:
            instance.set_password(password)
        if username:
            instance.set_username(username)
        if email:
            instance.set_email(email)
        return super().update(instance, validated_data)

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

        
