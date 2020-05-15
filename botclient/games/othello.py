from games.board import Board

ROWS = 8
COLS = 8

class Othello:
    def __init__(self, first_player=0):
        self.first_player = first_player
        self.moves = []
        self.board = Board(8, 8)
        self.board[(3, 3)] = 0
        self.board[(3, 4)] = 1
        self.board[(4, 3)] = 1
        self.board[(4, 4)] = 0


    @staticmethod
    def from_api_json(json):
        self = Othello()
        self.moves = []
        player = 0
        for m in json['moves']:
            self.moves.append(Move.from_api_notation(m, player=player))
            player = 1 - player

        self.board = Board.from_square_list(json['board'], mapping={
            0: None, 1: 0, 2: 1,
            })
        return self

    
    def to_printable_string(self):
        return self.board.to_printable_string({
            None: '_',
            0: 'X',
            1: 'O',
        })


    def snapshot(self, normalized=False):
        first = self.current_player() if normalized else 0
        second = 1 - first
        return (
                self.board.snapshot({ None: 0, first: 1, second: 0 }),
                self.board.snapshot({ None: 0, first: 0, second: 1 }),
        )


    def piece_counts(self):
        xs = 0
        os = 0
        for pos, val in self.board:
            if val == 0: xs += 1
            if val == 1: os += 1
        return xs, os


    def piece_diff(self, normalized=False):
        xs, os = self.piece_counts()
        coeff = -1 if normalized and self.current_player() == 1 else 1
        return coeff * (xs - os)


    def apply_move(self, move):
        if not self.is_valid_move(move):
            raise ValueError('Invalid Move:', move)

        if move.space is None:
            return

        self.moves.append(move)
        self.board[move.space] = move.player
        for flip in self.flipped_by(move):
            self.board[flip] = move.player


    def is_valid_move(self, move):
        if move.space is None:
            moves = self.valid_moves(player=move.player, allow_pass=True)
            return len(moves) == 1 and moves[0].space is None

        return move.player == self.current_player() \
                and move.space in self.board \
                and self.board[move.space] is None \
                and self.flipped_by(move)


    def flipped_by(self, move):
        if move.space is None:
            return []

        def flipped_by_dir(dr, dc):
            flipped = []
            cur = (move.space[0] + dr, move.space[1] + dc)
            while cur in self.board and self.board[cur] is not None and self.board[cur] != move.player:
                flipped.append(cur)
                cur = (cur[0] + dr, cur[1] + dc)
            if cur in self.board and self.board[cur] == move.player:
                return flipped
            return []

        flipped = []
        for dr in range(-1, 2):
            for dc in range(-1, 2):
                if dr == 0 and dc == 0: continue
                flipped += flipped_by_dir(dr, dc)

        return flipped


    def current_player(self):
        return self.first_player ^ (len(self.moves) % 2)


    def game_over(self):
        return len(self.valid_moves()) == 0


    def winner(self):
        if not self.game_over():
            return None
        
        piece_diff = self.piece_diff()
        if piece_diff > 0: return 0
        if piece_diff < 0: return 1
        return None


    def valid_moves(self, player=None, allow_pass=True):
        if player is None:
            player = self.current_player()
        moves = [
            m
            for pos, val in self.board
            if self.is_valid_move(m := Move(player, pos))
        ]
        if moves:
            return moves

        if allow_pass and self.valid_moves(1 - player, allow_pass=False):
            return [Move(player, None)]
        return []


class Move:
    def __init__(self, player, space):
        self.player = player
        self.space = space

    @staticmethod
    def from_api_notation(m, player=None):
        if m == 'PASS': return Move(player, None)
        return Move(player, ('ABCDEFGH'.index(m[0]), '12345678'.index(m[1])))

    def __str__(self):
        if self.space is None: return 'PASS'
        return 'ABCDEFGH'[self.space[0]] + str(self.space[1] + 1)

    def __repr__(self): return str(self)

