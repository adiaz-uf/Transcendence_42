from rest_framework import serializers
from api.models import Match
from datetime import timedelta

# USED for reprenstation of DurationField. IN and OUT.
class CustomDurationField(serializers.DurationField):
    def to_representation(self, value):
        """
        Convert timedelta to 'MM:SS.uu' format.
        """
        if isinstance(value, timedelta):
            total_seconds = int(value.total_seconds())  # Get total seconds
            minutes, seconds = divmod(total_seconds, 60)  # Extract minutes & seconds
            microseconds = value.microseconds  # Extract microseconds
            return f"{minutes:02}:{seconds:02}.{microseconds:02}"  # Format MM:SS.uu
        return value  # Return as is if not a timedelta

    def to_internal_value(self, data):
        """
        Convert 'MM:SS.uu' string to timedelta.
        """
        try:
            minutes, seconds_micro = data.split(":")
            seconds, microseconds = seconds_micro.split(".")
            return timedelta(minutes=int(minutes), seconds=int(seconds), microseconds=int(microseconds) * 10000) #Milisecon
        except ValueError:
            raise serializers.ValidationError("Invalid duration format. Use MM:SS.uu")


# Match Serializer
class MatchSerializer(serializers.ModelSerializer):
    player_left_username = serializers.CharField(source='player_left.username', read_only=True)
    player_right_username = serializers.CharField(source='player_right.username', read_only=True,  allow_null=True, default=None)

    class Meta:
        model = Match
        fields = ['id', 'date', 'is_multiplayer', 'is_started', 'left_score', 'right_score', 
                  'match_duration', 'player_left_username', 'player_right_username']


#class MatchSerializer(serializers.ModelSerializer):
#    match_duration = CustomDurationField(required=False, default=timedelta(minutes=0))  # Default value
#    class Meta:
#        model = Match
#        fields = '__all__'