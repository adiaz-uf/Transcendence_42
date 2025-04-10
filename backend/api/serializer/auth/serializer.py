# serializers.py
from rest_framework_simplejwt.serializers import TokenRefreshSerializer

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        request = self.context.get("request")
        user = request.user if request else None

        if user and user.is_authenticated:
            user.active = True
            user.save(update_fields=['active'])

        return data
