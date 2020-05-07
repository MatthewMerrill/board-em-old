
class Game {
  constructor(id, skipInit) {
    this.id = id;
    this.type = 'connect4';
    this.moves = [];
    this.board = new Board();
    if (!skipInit) {
      this.board.init();
    }
  }

  currentPlayer() {
    return (this.moves.length & 1) + 1;
  }

  isValid(move) {
    return move.player === this.currentPlayer() && this.board.isValidMove(move);
  }

  makeMove(move) {
    if (move.player !== this.currentPlayer()) {
      throw new Exception("It's not your turn");
    }
    this.moves.push(move);
    this.board.applyMove(move);
  }
}
module.exports.Game = Game;

class Space {
  constructor(row, col) {
    this.row = row;
    this.col = col;
  }
  plus(dr, dc) {
    return new Space(this.row + dr, this.col + dc);
  }
  isValid() {
    return 0 <= this.row && this.row < 8 && 0 <= this.col && this.col < 8;
  }
  assertValid() {
    if (!this.isValid())
      throw new Exception('Space not valid');
  }
}

class Board {
  constructor() {
    this.state = [];
    for (let rowIdx = 0; rowIdx < 6; rowIdx++) {
      this.state.push(Array(7).fill(0));
    }
  }

  init() {
  }

  clone() {
    let copy = new Board();
    for (let rowIdx = 0; rowIdx < 6; rowIdx++) {
      for (let colIdx = 0; colIdx < 7; colIdx++) {
        copy.state[rowIdx][colIdx] = this.state[rowIdx][colIdx]
      }
    }
    return copy;
  }

  playerAt(space) {
    space.assertValid();
    return this.state[space.row][space.col];
  }

  hasWinnerInDir(rowIdx, colIdx, dir) {
    try {
      let exp = this.state[rowIdx][colIdx];
      if (exp == 0) {
        return false;
      }
      for (let i = 0; i < 4; i++) {
        if (this.state[rowIdx + dir[0] * i][colIdx + dir[1] * i] !== exp) {
          return false;
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  hasWinner() {
    for (let rowIdx = 0; rowIdx < 6; rowIdx++) {
      for (let colIdx = 0; colIdx < 7; colIdx++) {
        let dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
        for (let dir of dirs) {
          if (this.hasWinnerInDir(rowIdx, colIdx, dir)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  applyMove(move) {
    if (!this.isValidMove(move)) {
      throw new Error('Invalid Move!');
    }
    let height = this.rowHeight(move.colIdx);
    this.state[height][move.colIdx] = move.player;
  }

  isValidMove(move) {
    return 0 <= move.colIdx && move.colIdx < 7
      && this.rowHeight(move.colIdx) < 6;
  }

  rowHeight(colIdx) {
    let height = 6;
    while (height > 0 && this.state[height - 1][colIdx] == 0) {
      height -= 1;
    }
    return height;
  }

  validMoves(player) {
    if (this.hasWinner()) {
      return [];
    }
    let moves = [];
    for (let colIdx = 0; colIdx < 7; colIdx++) {
      let move = new Move(player, colIdx);
      if (this.isValidMove(move)) {
        moves.push(move);
      }
    }
    return moves;
  }

  toString() {
    let rows = this.state.map((row, rowIdx) => row.map(ch => '_XO'[ch]).join(' '));
    rows.reverse();
    return '1 2 3 4 5 6 7\n' + rows.join('\n');
  }
}
module.exports.Board = Board;

class Move {
  constructor(player, colIdx) {
    this.player = player;
    this.colIdx = colIdx;
  }

  toString() {
    return '' + (this.colIdx + 1);
  }
}
Move.fromString = function(player, s) {
  if (s.length != 1) { throw new Error('Move must be 1 char'); }
  return new Move(player, '12345678'.indexOf(s));
}

module.exports.Move = Move;

