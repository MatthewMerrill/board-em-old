
class Game {
  constructor(id, skipInit) {
    this.id = id;
    this.type = 'othello';
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

  clone() {
    let copy = new Board();
    for (let rowIdx = 0; rowIdx < 8; rowIdx++) {
      for (let colIdx = 0; colIdx < 8; colIdx++) {
        copy.state[rowIdx][colIdx] = this.state[rowIdx][colIdx]
      }
    }
    return copy;
  }

  playerAt(space) {
    space.assertValid();
    return this.state[space.row][space.col];
  }

  applyMove(move) {
    if (!this.isValidMove(move)) {
      throw new Error('Invalid Move!');
    }
    if (move.space === null) {
      return;
    }
    this.state[move.space.row][move.space.col] = move.player;
    let flips = this.flippedBy(move);
    for (let flip of flips) {
      this.state[flip.row][flip.col] = move.player;
    }
  }

  isValidMove(move) {
    if (move.space === null) {
      let moves = this.validMoves(move.player, false);
      return moves.length === 1 && moves[0].space === null;
    }
    return move.space.isValid()
      && this.state[move.space.row][move.space.col] === 0
      && this.flippedBy(move).length > 0;
  }

  flippedBy(move) {
    if (move.space === null) {
      return [];
    }
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

  validMoves(player, disregardPass) {
    let moves = [];
    for (let rowIdx = 0; rowIdx < 8; rowIdx++) {
      for (let colIdx = 0; colIdx < 8; colIdx++) {
        let move = new Move(player, rowIdx, colIdx);
        if (this.isValidMove(move)) {
          moves.push(move);
        }
      }
    }
    if (moves.length === 0 && !disregardPass && this.validMoves(player ^ 3, true).length > 0) {
      moves.push(new Move(player, -1, -1));
    }
    return moves;
  }

  toString() {
    let render = this.state.map((row, rowIdx) => 'ABCDEFGH'[rowIdx] + ' '
      + row.map(ch => '_XO'[ch]).join(' ')).join('\n')
      + '\n  1 2 3 4 5 6 7 8\n\n';
    let os = 0;
    let xs = 0;
    for (let ch of render) {
      if (ch == 'O') os++;
      if (ch == 'X') xs++;
    }
    render += 'X: ' + ('' + xs).padStart(2) + '   O: ' + ('' + os).padStart(2);
    return render;
  }
}
module.exports.Board = Board;

class Move {
  constructor(player, rowIdx, colIdx) {
    this.player = player;
    if (rowIdx == -1 && colIdx == -1) {
      this.space = null;
    }
    else {
      this.space = new Space(rowIdx, colIdx);
    }
  }

  toString() {
    if (this.space === null) {
      return 'PASS';
    }
    return 'ABCDEFGH'[this.space.row] + (this.space.col + 1);
  }
}
Move.fromString = function(player, s) {
  if (s === 'PASS') {
    return new Move(player, -1, -1);
  }
  return new Move(player, 'ABCDEFGH'.indexOf(s[0]), '12345678'.indexOf(s[1]));
}

module.exports.Move = Move;
