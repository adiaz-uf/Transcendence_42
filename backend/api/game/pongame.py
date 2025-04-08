import json
import math
import random

class PongGame:
    def __init__(self, player1, player2=None, width=900, height=700):
        self.__left_player = player1
        self.__right_player = player2
        self.__width = width
        self.__height = height
        self.__initial_ball_speed = 5  # Base speed
        self.__max_ball_speed = 8      # Maximum speed
        self.__max_score = 10
        self.reset_game()

    def get_gameState(self):
        return {
            "players": self.__players,
            "ball": self.__ball,
            "active": self.__game_active
        }

    def IsGameActive(self):
        return self.__game_active

    def SetGameActive(self, active):
        was_active = self.__game_active
        self.__game_active = bool(active)
        
        # Only initialize ball velocity when transitioning from inactive to active
        if not was_active and self.__game_active:
            self.reset_ball(random.choice(['left', 'right']))

    def set_player2(self, player2):
        self.__right_player = player2

    def get_players(self, side):
        return self.__players.get(side, {})

    def reset_game(self):
        # Players State
        self.__players = {
            'left': {
                'id': self.__left_player,
                'x': 20,  # Closer to edge
                'y': self.__height / 2 - 45,
                'width': 15,
                'height': 90,
                'speed': 8,
                'score': 0
            },
            'right': {
                'id': self.__right_player,
                'x': self.__width - 35,  # Closer to edge
                'y': self.__height / 2 - 45,
                'width': 15,
                'height': 90,
                'speed': 8,
                'score': 0
            }
        }
        # Ball State
        self.__ball = {
            'x': self.__width / 2,
            'y': self.__height / 2,
            'radio': 10,
            'rx': 0,  # Initialize with 0 velocity
            'ry': 0   # Initialize with 0 velocity
        }
        # Game State
        self.__game_active = False

    def move_players(self, side, direction):
        if side not in self.__players:
            return

        player = self.__players[side]
        speed = player['speed']

        if direction == 'up':
            player['y'] = max(0, player['y'] - speed)
        elif direction == 'down':
            player['y'] = min(self.__height - player['height'], player['y'] + speed)

    def update_ball(self):
        if not self.__game_active:
            return

        # Update ball position
        self.__ball['x'] += self.__ball['rx']
        self.__ball['y'] += self.__ball['ry']

        # Ball collision with top and bottom walls
        if self.__ball['y'] <= 0 or self.__ball['y'] >= self.__height:
            self.__ball['ry'] *= -1

        # Collision with paddles
        for side, paddle in self.__players.items():
            if self.check_ball_paddle_collision(paddle):
                # Reverse horizontal direction
                self.__ball['rx'] *= -1
                
                # Increase speed up to max_ball_speed
                current_speed = math.sqrt(self.__ball['rx']**2 + self.__ball['ry']**2)
                if current_speed < self.__max_ball_speed:
                    speed_multiplier = min(1.1, self.__max_ball_speed / current_speed)
                    self.__ball['rx'] *= speed_multiplier
                    self.__ball['ry'] *= speed_multiplier
                
                # Add slight vertical angle change based on where the ball hits the paddle
                hit_position = (self.__ball['y'] - paddle['y']) / paddle['height']  # 0 to 1
                angle_factor = (hit_position - 0.5) * 0.5  # -0.25 to 0.25
                speed = math.sqrt(self.__ball['rx']**2 + self.__ball['ry']**2)
                self.__ball['ry'] = speed * angle_factor
                break

        # Points
        if self.__ball['x'] <= 0:
            self.__players['right']['score'] += 1
            if self.__players['right']['score'] >= self.__max_score:
                self.__game_active = False
            self.reset_ball('right')
        elif self.__ball['x'] >= self.__width:
            self.__players['left']['score'] += 1
            if self.__players['left']['score'] >= self.__max_score:
                self.__game_active = False
            self.reset_ball('left')

    def check_ball_paddle_collision(self, paddle):
        return (
            self.__ball['x'] >= paddle['x'] and
            self.__ball['x'] <= paddle['x'] + paddle['width'] and
            self.__ball['y'] >= paddle['y'] and
            self.__ball['y'] <= paddle['y'] + paddle['height']
        )

    def reset_ball(self, scoring_side):
        self.__ball['x'] = self.__width / 2
        self.__ball['y'] = self.__height / 2
        
        # Set initial velocity based on scoring side
        self.__ball['rx'] = self.__initial_ball_speed if scoring_side == 'right' else -self.__initial_ball_speed
        
        # Add a small random vertical component
        self.__ball['ry'] = self.__initial_ball_speed * (random.random() * 0.4 - 0.2)  # -0.2 to 0.2 of base speed
