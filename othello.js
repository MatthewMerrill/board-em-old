
class Game {
  constructor(id, skipInit) {
    this.id = id;
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
    for (let rowIdx = 0; rowIdx < 8; rowIdx++) {
      this.state.push(Array(8).fill(0));
    }
  }

  init() {
    this.state[3][3] = 1;
    this.state[3][4] = 2;
    this.state[4][3] = 2;
    this.state[4][4] = 1;
  }

  playerAt(space) {
    space.assertValid();
    return this.state[space.row][space.col];
  }

  applyMove(move) {
    if (!this.isValidMove(move)) {
      throw new Exception('Invalid Move!');
    }
    this.state[move.space.row][move.space.col] = move.player;
    let flips = this.flippedBy(move);
    for (let flip of flips) {
      this.state[flip.row][flip.col] = move.player;
    }
  }

  isValidMove(move) {
    return move.space.isValid()
      && this.state[move.space.row][move.space.col] === 0
      && this.flippedBy(move).length > 0;
  }

  flippedBy(move) {
    let {player, space} = move;
    let flipped = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;

        let flippedThisWay = [];
        let cur = space.plus(dr, dc);
        while (cur.isValid()
            && this.playerAt(cur) !== 0
            && this.playerAt(cur) !== player) {
          flippedThisWay.push(cur);
          cur = cur.plus(dr, dc);
        }
        if (cur.isValid() && this.playerAt(cur) === player) {
          flipped = flipped.concat(flippedThisWay);
        }
      }
    }
    return flipped;
  }

  validMoves(player) {
    let moves = [];
    for (let rowIdx = 0; rowIdx < 8; rowIdx++) {
      for (let colIdx = 0; colIdx < 8; colIdx++) {
        let move = new Move(player, rowIdx, colIdx);
        if (this.isValidMove(move)) {
          moves.push(move);
        }
      }
    }
    return moves;
  }

  toString() {
    return this.state.map(row => row.map(ch => ['_','X','O'][ch]).join(' ')).join('\n');
  }
}
module.exports.Board = Board;

class Move {
  constructor(player, rowIdx, colIdx) {
    this.player = player;
    this.space = new Space(rowIdx, colIdx);
  }
}
module.exports.Move = Move;
