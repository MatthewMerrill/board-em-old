from actor import Actor
from api import GameRef

class FirstChoiceActor(Actor):

    def get_move(self):
        moves = self.game.valid_moves()
        return moves[0]['move']
