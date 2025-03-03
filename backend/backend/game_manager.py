import uuid

class GameManager:
    def __init__(self):
        self.games = {}  # List active games
        self.players = {}  # Add a player to a game

    def create_game(self):
        game_id = str(uuid.uuid4())
        self.games[game_id] = {
            "players": [],
            "ball": {"x": 50, "y": 50, "vx": 5, "vy": 5},
            "paddles": {"player1": 40, "player2": 40},
            "scores": {"player1": 0, "player2": 0}
        }
        return game_id

    def add_player_to_game(self, player_id):
        for game_id, game in self.games.items():
            if len(game["players"]) < 2:
                game["players"].append(player_id)
                self.players[player_id] = game_id
                return game_id

        new_game_id = self.create_game()
        self.games[new_game_id]["players"].append(player_id)
        self.players[player_id] = new_game_id
        return new_game_id

    def remove_player(self, player_id):
        if player_id in self.players:
            game_id = self.players[player_id]
            self.games[game_id]["players"].remove(player_id)
            del self.players[player_id]

            if len(self.games[game_id]["players"]) == 0:
                del self.games[game_id]

    def update_paddle(self, game_id, player_id, move):
        if game_id in self.games:
            player = "player1" if self.games[game_id]["players"][0] == player_id else "player2"
            if move == "up":
                self.games[game_id]["paddles"][player] = max(0, self.games[game_id]["paddles"][player] - 5)
            elif move == "down":
                self.games[game_id]["paddles"][player] = min(100, self.games[game_id]["paddles"][player] + 5)

game_manager = GameManager()
