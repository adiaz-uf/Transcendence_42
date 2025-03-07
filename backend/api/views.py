from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, NoteSerializer, TournamentSerializer, MatchSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Note, Tournament, Match

class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)

class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

#class CreateUserView(generics.CreateAPIView):
class CreateUserView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]  # Asegura que el usuario esté autenticado

    def get(self, request):
        user = request.user  # Obtiene el usuario autenticado
        serializer = UserSerializer(user)  # Serializa los datos del usuario
        return Response(serializer.data)  # Devuelve los datos serializados

class CreateTournamentView(generics.CreateAPIView):
    serializer_class = TournamentSerializer
    queryset = Tournament.objects.all()
    permission_classes = [AllowAny]

class CreateMatchView(generics.CreateAPIView):
    serializer_class = MatchSerializer
    queryset = Match.objects.all()
    permission_classes = [AllowAny]

# Create your views here.
