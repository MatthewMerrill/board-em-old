const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const {Game, Board} = require('./othello.js');

const uuidv4 = require('uuid').v4;

class Store {
  constructor() {
    this.adapter = new FileSync('db.json');
    this.db = low(this.adapter);
    this.db.defaults({games: {}}).write();
  }

  loadGameObject(gameId) {
    let val = this.db.get('games').get(gameId).value();
    if (!val) return val;
    let game = new Game(gameId, false);
    game = Object.assign(game, val);
    game.board = Object.assign(new Board(), game.board);
    return game;
  }

  saveGameObject(game) {
    let val = this.db.get('games').set(game.id, game).write();
  }

  getGame(gameId) {
    let game = this.loadGameObject(gameId);
    if (!game) return game;
    return {id: game.id, moves: game.moves, board: game.board.toString()};
  }

  createGame() {
    let id = uuidv4();
    let game = new Game(id);
    this.saveGameObject(game);
    return game;
  }

  getMove(gameId, move) {
    let game = this.loadGameObject(gameId);
    if (!game) return null;
    return game.moves[move];
  }

  getNumberMoves(gameId) {
    let game = this.loadGameObject(gameId);
    return game.moves.length;
  }

  makeMove(gameId, move, moveNumber) {
    let game = this.loadGameObject(gameId);
    if (moveNumber !== undefined && moveNumber !== game.moves.length) {
      throw Exception('Wrong number of moves');
    }
    game.makeMove(move);
    this.saveGameObject(game);
  }
}

module.exports = new Store();
