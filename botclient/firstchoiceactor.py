class FirstChoiceActor:
    def get_move(self, game):
        moves = game.valid_moves()
        return moves[0]
