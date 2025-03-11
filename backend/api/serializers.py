from rest_framework import serializers
from .models import UserProfile, Tournament, Match

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["id", "username", "password", "email", "given_name", "surname"]                 #These are all the fields which will be serialized when accepting and/or returning a user
        extra_kwargs = {"password": {"write_only": True}}       #Write only means this field wont be returned and cant be read be users
        
    def create(self, validated_data):                           #This will be called when creaing a user. validated data is sent via JSON and contains the fields created above
        user = UserProfile.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            email=validated_data.get("email", ""),
            given_name=validated_data.get("given_name", ""),
            surname=validated_data.get("surname", "")
        )       #This data is then stored in a user and returned, this def is created in CustomUserManager
        return user
    

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["email", "username", "given_name", "surname"]

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = '__all__'

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = '__all__'

class MatchesPlayedSerializer(serializers.Serializer):
    matches_played = serializers.IntegerField()

        
