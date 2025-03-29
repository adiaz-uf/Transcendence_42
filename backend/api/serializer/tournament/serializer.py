from rest_framework import serializers
from api.models import Match, Tournament

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