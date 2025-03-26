import uuid
from .game import PongGame

class GameManager:
    def __init__(self):
        self.games = {}  # Dictionnaire pour stocker les joueurs par game_id
        self.players = {}  # Associer un joueur à un game_id
        self.game_instances = {}  # Stocker les instances de PongGame par game_id
        self.game_modes = {}  # Stocker le mode de jeu par game_id

    def add_player_to_game(self, player_id, game_id, game_mode="remote"):
        # Stocker le mode de jeu
        if game_id not in self.game_modes:
            self.game_modes[game_id] = game_mode

        # En mode local, un seul joueur est nécessaire
        if self.game_modes[game_id] == "local":
            if game_id not in self.games:
                self.games[game_id] = []
                self.game_instances[game_id] = PongGame()
            if player_id not in self.games[game_id]:
                self.games[game_id].append(player_id)
                self.players[player_id] = game_id
            return game_id

        # En mode remote, limiter à 2 joueurs
        if game_id in self.games and len(self.games[game_id]) >= 2:
            return None  # Retourner None si le jeu est déjà plein

        if game_id not in self.games:
            self.games[game_id] = []
            self.game_instances[game_id] = PongGame()

        if player_id not in self.games[game_id]:
            self.games[game_id].append(player_id)
            self.players[player_id] = game_id
        return game_id

    def remove_player(self, player_id, game_id):
        if player_id in self.players and game_id in self.games:
            self.games[game_id].remove(player_id)
            del self.players[player_id]
            if len(self.games[game_id]) == 0:
                del self.games[game_id]
                del self.game_instances[game_id]
                if game_id in self.game_modes:
                    del self.game_modes[game_id]
        return self.games.get(game_id, [])

    def get_game_instance(self, game_id):
        return self.game_instances.get(game_id)

    def get_game_mode(self, game_id):
        return self.game_modes.get(game_id, "remote")

game_manager = GameManager()
