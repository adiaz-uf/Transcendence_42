import json
import math
import random
from asyncio import Lock

# NOTESSS  Mutex order

#game_active:
#ball read
#ball Write move
# READ width heigh
    #ball write 
# read players 
        # ball wirte
# ball read
    #Write Scores
# Write ball        


#

class PongGame:
    def __init__(self, player1, player2=None, width=900, height=700):
        self.__left_player = player1
        self.__right_player = player2
        self.__width = width
        self.__height = height
        self.__speed_ball = 3
        self.__max_score = 5

        self.__scores = {
            'left': 0,
            'right': 0
            }

        self.__game_active = False
    
        self.__players = {
                'left': {
                        'id':self.__left_player,
                        'x': 10,
                        'y': self.__height / 2 - 50,
                        'width': 15,
                        'height': 115,
                        'speed': 5,
                },
                'right': {
                        'id':self.__right_player,
                        'x': self.__width - 20,
                        'y': self.__height / 2 - 50,
                        'width': 15,
                        'height': 115,
                        'speed': 5,
                }
                }

        self.__ball = {
            'x': self.__width / 2,
            'y': self.__height / 2,
            'radio': 5,
            'rx': random.choice([-(self.__speed_ball), (self.__speed_ball)]),
            'ry': random.choice([-(self.__speed_ball), (self.__speed_ball)])
            }

        self.__mutex = Lock() # Mutex



    async def get_gameState(self):
        """Returns the current game state (players, ball, and game active state)"""
        print("get_gameState: called")
        async with self.__mutex:
            update = {
                "players": copy.deepcopy(self.__players),
                "ball": dict(self.__ball),
                "game_active": self._game_active,
                "scores": dict(self.__scores)
            }
        
        return (update)

    async def get_GameActive(self):
        async with self.__mutex:
            print("get_GameActive: Acquired mutex game active")
            return self.__game_active
        print("Released mutex game active")

    async def SetGameActive(self, active):
        async with self.__mutex:
            print("get_GameActive: Acquired mutex game active")
            self.__game_active = active
        print("SetGameActive: Game active set to ", self.__game_active)

    # async def get_scores(self):
    #     async with self.__mutex_score:
    #         return self.__scores
    
    # async def set_ball(self, ball):
    #     async with self.__mutex_ball:
    #         self.__ball = ball
        
    # async def get_player(self, side):
        # async with self.__mutex_players:
        #     return (self.__players.get(side,{}))

    async def reset_game(self):
        print("reset_game: called")
        # Ball State
        async with self.__mutex:
            for side in self.__players:
                self.__scores[side] = 0
            self.__ball = {
                "x": self.__width // 2,
                "y": self.__height // 2,
                "rx": -4,
                "ry": -4,
            }
            self._game_active = False
        

    async def move_players(self, side, direction):
        async with self.__mutex:
            if direction == 'up':
                self.__players[side]['y'] = max(0, self.__players[side]['y'] - self.__players[side]['speed'])
            elif direction == 'down':
                self.__players[side]['y'] = min(self.__height - self.__players[side]['height'], self.__players[side]['y'] + self.__players[side]['speed'])

    async def update_ball(self, window_large_size):
        print("Update_ball Called")
        async with self.__mutex:
            print("Update_ball: Acquired mutex Update_ball")
            ball = self.__ball
            speed = self.__speed_ball
            # Ball position
            ball["x"] += ball["rx"]
            ball["y"] += ball["ry"]

            # Vertical collision Y axis
            if (ball['y'] <= 0 or ball['y'] >= window_large_size): 
                ball['ry'] *= -1
            
            # Player collision
            for side, paddle in self.__players.items():
                if self.__check_ball_paddle_collision(ball, paddle):
                    ball['rx'] *= -1.1

            # Horizontal collision X axis
            if self.ball['x'] <= 0: # or self.__ball['x'] >= self.__width:
                self.__scores['right'] += 1
                ball = self.__reset_ball(ball, 'left', speed)
            elif self.ball['x'] >= self.__width:
                self.__scores['left'] += 1
                ball = self.__reset_ball(ball, 'right', speed)

            self.__ball = ball

        print("Update_ball: RETURN Released mutex Update_ball")

    #         if ball['x'] <= 0:
    #             self.__scores['right'] = self.__scores['right'] + 1
    #             self.reset_ball()
    #         elif ball['x'] >= self.__width:
    #             self.__scores['left'] = self.__scores['left'] + 1
    #             self.reset_ball()

    async def __check_ball_paddle_collision(self, ball,  paddle):
        """Check if the ball collides with the paddle. Used in the update_ball"""
        return (
                (ball['x'] >= paddle['x']) and 
                (ball['x'] <= paddle['x'] + paddle['width']) and
                (ball['y'] >= paddle['y']) and 
                (ball['y'] <= paddle['y'] + paddle['height'])
            )

    def __reset_ball(self, ball, scoring_side, speed):
        """Reset the ball position and direction. Used in the update_ball"""
            # Reset ball position
        ball['x'] = self.__width / 2
        ball['y'] = self.__height / 2
        # Reset ball direction
        if scoring_side == 'left':
            ball['rx'] = -speed
        else:
            ball['rx'] = (speed)
        ball['ry'] = random.choice([-(speed), (speed)])
        return ball

    async def IsScoreReachedSoEndGame(self, ):
        print("ISScoreReachedSoEndGame: called")
        async with self.__mutex:
            if self.__scores['left'] >= self.__max_score or self.__scores['right'] >= self.__max_score:
                self.__game_active = False
                return True
            return False
