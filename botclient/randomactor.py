import random

class RandomActor:
    def get_move(self, game):
        moves = game.valid_moves()
        return random.choice(moves)
