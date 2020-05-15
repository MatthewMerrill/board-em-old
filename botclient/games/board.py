from itertools import product

class Board:
    def __init__(self, rows, cols, empty=None):
        self.rows = rows
        self.cols = cols
        self.empty = empty
        self.spaces = None
        self.clear()


    @staticmethod
    def from_square_list(l, empty=None, mapping=None):
        R = len(l)
        C = len(l[0]) if l else 0
        self = Board(R, C)
        for p in product(range(R), range(C)):
            val = l[p[0]][p[1]]
            if mapping is not None: val = mapping[val]
            self[p] = val
        return self


    def clear(self):
        self.spaces = {
            p: self.empty
            for p in product(range(self.rows), range(self.cols))
        }


    def __iter__(self):
        return ((pos, self[pos]) for pos in product(range(self.rows), range(self.cols)))


    def __getitem__(self, pos):
        self.assert_valid_space(pos)
        return self.spaces[pos]


    def get(self, pos, default=None):
        piece = self[pos]
        return piece if piece is not None else default


    def __setitem__(self, pos, piece):
        self.assert_valid_space(pos)
        self.spaces[pos] = piece


    def is_valid_space(self, pos):
        return pos in self.spaces


    __contains__ = is_valid_space


    def assert_valid_space(self, pos):
        if not self.is_valid_space(pos):
            raise ValueError(f'Invalid pos for {self.rows}x{self.cols}: {pos}')


    def move_piece(self, f, t):
        self.spaces[t], self.spaces[f] = self.spaces[f], None


    def to_printable_string(self, mapping, reversed_rows=False):
        row_strs = []
        for row_idx in range(self.rows):
            row_strs.append('')
            for col_idx in range(self.cols):
                row_strs[row_idx] += mapping[self[(row_idx, col_idx)]]

        if reversed_rows:
            row_strs = reversed(row_strs)

        return '\n'.join(row_strs)


    def snapshot(self, mapping):
        return tuple(
                tuple(mapping[self[(row, col)]] for col in range(self.cols))
                for row in range(self.rows))


        
