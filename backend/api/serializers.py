from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from .models import UserProfile, Tournament, Match, GoalStat, UserStat


CurrentUser = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [ 
            "id",
            "email", 
            "username", 
            "given_name", 
            "surname",
            "last_active",
            "password",
            "is_42user",
            "is_2fa_enabled",
            "totp_secret"]
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
        model = CurrentUser
        fields = ["email", "username", "given_name", "surname", "password"]
        extra_kwargs = {
            "password": {"write_only": True, "required": False},  # Password shouldn't be readable
            "email": {"required": False},
            "username": {"required": False},
        }

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        """Update user profile details safely."""
        
        # Update fields if provided
        if "email" in validated_data:
            instance.email = validated_data["email"]

        if "username" in validated_data:
            instance.username = validated_data["username"]

        if "password" in validated_data:
            instance.set_password(password)
        
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

from rest_framework import serializers
from .models import Match, UserProfile

class MatchCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = ['match_duration', 'left_score', 'right_score', 'is_multiplayer', 'is_started', 'player_left', 'player_right']

    def validate_player_right(self, value):
        """Buscar al jugador derecho por su nombre de usuario (username)."""
        player_right = UserProfile.objects.filter(username=value).first()
        if not player_right:
            raise ValidationError(f"El jugador derecho con el nombre de usuario '{value}' no existe.")
        return player_right

    def create(self, validated_data):
        """Crear el partido y asignar correctamente los jugadores."""
        # Obtener el jugador que está autenticado (player_left)
        player_left = self.context['request'].user

        # Obtener el jugador derecho (player_right) a partir del username
        player_right = validated_data.get('player_right')

        # Validar que player_right esté presente y sea un usuario válido
        if not player_right:
            raise ValidationError("El jugador derecho es obligatorio.")
        
        # Crear el partido con los datos proporcionados
        match = Match.objects.create(
            player_left=player_left,
            player_right=player_right,
            match_duration=validated_data.get('match_duration', None),
            left_score=validated_data.get('left_score', 0),
            right_score=validated_data.get('right_score', 0),
            is_multiplayer=validated_data.get('is_multiplayer', False),
            is_started=validated_data.get('is_started', False)
        )
        
        return match

# Goal Statistics Serializer
class UserStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStat
        fields = '__all__'

        
