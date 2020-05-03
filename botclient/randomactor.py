import random

from actor import Actor

class RandomActor(Actor):
    def get_move(self):
        moves = self.game.valid_moves()
        return random.choice(moves)['move']


