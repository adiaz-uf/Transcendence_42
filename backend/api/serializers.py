from rest_framework import serializers
from .models import UserProfile, Tournament, Match, Team

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["id", "username", "password", "email", "given_name", "surname", "is_42user"]                 #These are all the fields which will be serialized when accepting and/or returning a user
        extra_kwargs = {"password": {"write_only": True}}       #Write only means this field wont be returned and cant be read be users
        
    def create(self, validated_data):                           #This will be called when creaing a user. validated data is sent via JSON and contains the fields created above
        user = UserProfile.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            email=validated_data.get("email", ""),
            given_name=validated_data.get("given_name", ""),
            surname=validated_data.get("surname", ""),
            is_42user=validated_data.get("is_42user", False)
        )       #This data is then stored in a user and returned, this def is created in CustomUserManager
        return user
    

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["email", "username", "given_name", "surname", "password"]
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        # Si la contraseña es proporcionada, la actualizamos
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'name', 'player1_id', 'player2_id']

class MatchSerializer(serializers.ModelSerializer):
    team_left = TeamSerializer()
    team_right = TeamSerializer()
    class Meta:
        model = Match
        fields = ['id', 'team_left', 'team_right', 'winner']

class TournamentSerializer(serializers.ModelSerializer):
    teams = TeamSerializer(many=True, read_only=True)
    class Meta:
        model = Tournament
        fields = ['id', 'name', 'teams']

        
