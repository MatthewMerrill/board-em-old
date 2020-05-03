from api import GameRef

class Actor:
    def __init__(self, game: GameRef):
        self.game = game


    def get_move(self):
        pass


    def make_move(self):
        if not self.game.is_my_turn():
            raise Exception('It is not my turn')
        self.game.make_move(self.get_move())


    def play(self):
        while True:
            self.game.spin_until_turn()
            print('It is my turn now!')
            if len(self.game.valid_moves()):
                self.make_move()
            else:
                break


