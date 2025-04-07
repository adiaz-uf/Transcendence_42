import json
import math
import random
from asyncio import Lock

# Mutex order
#ball
#players
#active
#score

#game_active:
#
#Score 
#Players

#async with self.__mutex_ball:
#

class PongGame:
    def __init__(self, player1, player2=None, width=900, height=700):
        self.__left_player = player1
        self.__right_player = player2
        self.__width = width
        self.__height = height
        self.__speed_ball = 3
        self.__max_score = 5

        self.__scores = {}
        self.__mutex_score = Lock()

        self.__game_active = False
        self.__mutex_game_active = Lock()
    
        self.__players = {}
        self.__mutex_players = Lock() 

        self.__ball = {}
        self.__mutex_ball = Lock() # Mutex



    async def get_gameState(self):
        """Returns the current game state (players, ball, and game active state)"""
        print("get_gameState: called")
        async with self.__mutex_ball:
            ball_state = self.__ball.copy()  # faster for lock?

        async with self.__mutex_players:
            players_state = self.__players.copy()

        async with self.__mutex_game_active:
            game_active = self.__game_active  

        return {
        "players": players_state,
        "ball": ball_state,
        "game_active": game_active,
        }

    async def get_ball(self):
        async with self.__mutex_ball:
            return self.__ball


    async def get_GameActive(self):
        async with self.__mutex_game_active:
            print("get_GameActive: Acquired mutex game active")
            return self.__game_active
        print("Released mutex game active")

    async def SetGameActive(self, active):
        async with self.__mutex_game_active:
            print("get_GameActive: Acquired mutex game active")
            self.__game_active = active
        print("SetGameActive: Game active set to ", self.__game_active)

    async def get_scores(self):
        async with self.__mutex_score:
            return self.__scores
    
    async def set_addOne_toScorePlayerSide(self, side):
        async with self.__mutex_score:
            self.__scores[side] = self.__scores[side] + 1

    
    # async def set_ball(self, ball):
    #     async with self.__mutex_ball:
    #         self.__ball = ball
        
    async def get_player(self, side):
        async with self.__mutex_players:
            return (self.__players.get(side,{}))
    
    async def set_player2(self, player2):
        async with self.__mutex_players:
            self.__right_player = player2 #id
    
    
    async def reset_game(self):
        print("reset_game: called")
        # Ball State
        async with self.__mutex_ball:
            print("reset_game: Acquired mutex ball")
            self.__ball = {
            'x': self.__width / 2,
            'y': self.__height / 2,
            'radio': 5,
            'rx': random.choice([-(self.__speed_ball), (self.__speed_ball)]),
            'ry': random.choice([-(self.__speed_ball), (self.__speed_ball)])
            }
        print("reset_game: Released mutex ball")
        # Players State
        async with self.__mutex_players:
            print("reset_game: Acquired mutex players")
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
        print("reset_game: Released mutex ball")

        # Game Active bool
        await self.SetGameActive(False)

        # Scores
        async with self.__mutex_score:
            print("reset_game: Acquired mutex score")
            self.__scores ={
            'left': 0,
            'right': 0
            }
        print("reset_game: released mutex score")
        

    async def move_players(self, side, direction):
        async with self.__mutex_players:
            if direction == 'up':
                self.__players[side]['y'] = max(0, self.__players[side]['y'] - self.__players[side]['speed'])
            elif direction == 'down':
                self.__players[side]['y'] = min(self.__height - self.__players[side]['height'], self.__players[side]['y'] + self.__players[side]['speed'])
            return {
                "players": { side : self.__players[side]}
            }

    async def update_ball(self, window_height_size, window_width_size):
        print("Update_ball Called")
        async with self.__mutex_ball:
            ball = self.__ball            
            # Ball position
            ball['x'] += ball['rx']
            ball['y'] += ball['ry']

            if (ball['y'] <= 0 or ball['y'] >= window_height_size): #Vertical collision
                ball['ry'] *= -1

            if ball['x'] <= 0 or ball['x'] >= window_width_size:
                return {
                    "ball":ball,
                    "goal": 'right' if (ball['x'] <= 0) else 'left'
                }

            async with self.__mutex_players:
                print("Check_collision_ballplayer: Player mutex LOCKED")
                for side, paddle in self.__players.items():
                    if self.check_ball_paddle_collision(ball, paddle):
                        ball['rx'] *= -1.1

            print("Check_collision_ballPlayer: Player mutex UNLOCKED")
            return {
                "ball": ball
            }

            # if self.__ball['x'] <= 0:
            #     await self.set_addOne_toScorePlayerSide('right')
            #     self.reset_ball('left')
            # elif self.__ball['x'] >= self.__width:
            #     await self.set_addOne_toScorePlayerSide('left')
            #     self.reset_ball('right')

            # #check paddle collsion:

    async def check_ball_paddle_collision(self, ball, paddle):
        """Check if the ball collides with the paddle. Used in the update_ball"""
        return (
                (ball['x'] >= paddle['x']) and 
                (ball['x'] <= paddle['x'] + paddle['width']) and
                (ball['y'] >= paddle['y']) and 
                (ball['y'] <= paddle['y'] + paddle['height'])
            )

    async def ball_goal_collision(self, side):
        async with self.__mutex_score:
            if side == "left":
                self.__scores['left'] += 1
            elif side =='right':
                self.__scores['right'] += 1
            return {
                "scores": self.__scores
            }
    def reset_ball(self, ball, scoring_side, window_height_size,window_width_size):
        """Reset the ball position and direction. Used in the update_ball"""
            # Reset ball position
        
        ball['x'] = window_width_size / 2
        ball['y'] = window_height_size / 2

        speed = self.__speed_ball
        # Reset ball direction
        if scoring_side == 'left':
            ball['rx'] = -speed
        else:
            ball['rx'] = speed
        ball['ry'] = random.choice([-speed, speed])

    async def IsScoreReachedSoEndGame(self):
        print("ISScoreReachedSoEndGame: called")
        scores = await self.get_scores()
        async with self.__mutex_game_active:
            if scores['left'] == self.__max_score or scores['right'] == self.__max_score:
                self.game_active = False
                return True
            return False
