from rest_framework import serializers
from api.models import Match, Tournament, UserProfile


class TournamentSerializer(serializers.ModelSerializer):
    players = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=UserProfile.objects.all(),
        write_only=True,
        required=False
    )
    matches = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Match.objects.all(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Tournament
        fields = '__all__'

    def create(self, validated_data):
        players = validated_data.pop('players', [])
        matches = validated_data.pop('matches', [])
        tournament = Tournament.objects.create(**validated_data)
        tournament.players.set(players)
        tournament.matches.set(matches)
        return tournament