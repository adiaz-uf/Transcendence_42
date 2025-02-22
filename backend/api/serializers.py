from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]                 #These are all the fields which will be serialized when accepting and/or returning a user
        extra_kwargs = {"password": {"write_only": True}}       #Write only means this field wont be returned and cant be read be users
        
    def create(self, validated_data):                           #This will be called when creaing a user. validated data is sent via JSON and contains the fields created above
        user = User.objects.create_user(**validated_data)       #This data is then stored in a user and returned, this def is created in CustomUserManager
        return user

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author": {"read_only": True}}
        
