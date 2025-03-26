import json
import math
import random

class PongGame:
    def __init__(self, width=900, height=700):
        self.width = width
        self.height = height
        self.speed_pelota = 12
        self.max_score = 10
        self.reset_game()

    def get_gameState(self):
        return self.__dict__

    def reset_game(self):
        # Estado Jugadores
        self.jugadores = {
            'izq': {
                'x': 10,
                'y': self.height / 2 - 50,
                'width': 15,
                'height': 115,
                'speed': 5,
                'score': 0
            }, 
            'der': {
                'x': self.width - 20,
                'y': self.height / 2 - 50,
                'width': 15,
                'height': 115,
                'speed': 5,
                'score': 0
            }
        }

        # Estado Pelota
        self.pelota = {
            'x': self.width / 2,
            'y': self.height / 2,
            'radio': 5,
            'dx': random.choice([-(self.speed_pelota), (self.speed_pelota)]),
            'dy': random.choice([-(self.speed_pelota), (self.speed_pelota)])
        }
        # Main Game loop
        self.game_active = True

    def mover_jugadores(self, side, direction):
        jugador = self.jugadores[side]
        
        if direction == 'up':
            jugador['y'] = max(0, jugador['y'] - jugador['speed'])

        elif direction == 'down':
            jugador['y'] = min(self.height - jugador['height'], jugador['y'] + jugador['speed'])

    def update_pelota(self):

        #bola
        self.pelota['x'] += self.pelota['dx']
        self.pelota['y'] += self.pelota['dy']

        #colision vertical
        if (self.pelota['y'] <= 0 or 
            self.pelota['y'] >= self.height):
            self.pelota['dy'] *= -1

        #Colision jugadores
        for side, paddle in self.jugadores.items():
            if self.check_pelota_paddle_collision(paddle):
                self.pelota['dx'] *= -1.1  # subir un poquito de velocidad
                break

        #Puntos
        if self.pelota['x'] <= 0:
            self.jugadores['izq']['score'] += 1
            self.reset_pelota('izq')
        elif self.pelota['x'] >= self.width:
            self.jugadores['der']['score'] += 1
            self.reset_pelota('der')

    def check_pelota_paddle_collision(self, paddle):
        return (
            (self.pelota['x'] >= paddle['x']) and 
            (self.pelota['x'] <= paddle['x'] + paddle['width']) and
            (self.pelota['y'] >= paddle['y']) and 
            (self.pelota['y'] <= paddle['y'] + paddle['height'])
        )

    def reset_pelota(self, scoring_side):
        self.pelota['x'] = self.width / 2
        self.pelota['y'] = self.height / 2
        self.pelota['dx'] = (self.speed_pelota) if scoring_side == 'izq' else -(self.speed_pelota)
        self.pelota['dy'] = random.choice([-(self.speed_pelota), (self.speed_pelota)])


    def endGame(self):
        if self.jugadores['izq']['score'] == self.max_score or self.jugadores['der']['score'] == self.max_score:
            self.game_active = False
        
