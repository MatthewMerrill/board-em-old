const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const GameTypes = require('./gameTypes.js');

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
    let {Game, Board} = GameTypes.getType(val.type);
    let game = new Game(gameId, true);
    game = Object.assign(game, val);
    game.board = Object.assign(new Board(), game.board);
    return game;
  }

  saveGameObject(game) {
    let val = this.db.get('games').set(game.id, game).write();
  }

  getGame(gameId) {
    let game = this.loadGameObject(gameId);
    let {Move} = GameTypes.getType(game.type);
    if (!game) return game;
    return {
      id: game.id,
      moves: game.moves.map(m => Object.assign(new Move(), m).toString()),
      board: game.board.state,
      render: game.board.toString(),
    };
  }

  createGame(gameType) {
    let id = uuidv4();
    let {Game} = GameTypes.getType(gameType);
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
