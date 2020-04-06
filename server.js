const express = require('express');
const app = express();
const port = 3000

const {Game, Move, Space} = require('./othello.js');
const store = require('./store.js');
const validation = require('./validation.js');

function badRequest(res, msg) {
  res.status(400);
  res.send({ code: 400, message: msg ? msg : 'Bad Request' });
}

function notFound(res) {
  res.status(404);
  res.send({ code: 404, message: 'Not Found' });
}

app.use(express.json());

app.get('/', (req, res) => res.redirect('http://www.mattmerr.com'));

app.get('/games', (req, res) => {
  let id = store.createGame();
  res.send({id});
});

app.get('/games/:game_id([a-z0-9-]+)', (req, res) => {
  let gameInfo = store.getGame(req.params.game_id);
  if (gameInfo) {
    res.send(gameInfo);
  }
  else {
    res.sendStatus(404);
  }
});

app.get('/games/:game_id([a-z0-9-]+)/validMoves', (req, res) => {
  let game = store.loadGameObject(req.params.game_id);
  if (!game) {
    res.sendStatus(404);
    return;
  }
  res.send(game.board.validMoves(game.currentPlayer()));
});


app.get('/games/:game_id([a-z0-9-]+)/moves/:move_id(\\d+)', (req, res) => {
  let gameId = req.params.game_id;
  let moveNumber = req.params.move_id * 1;
  
  // Doing the ! > -1 catches NaN
  if (!(moveNumber > -1)) {
    res.sendStatus(400);
    return;
  }
  if (!game || !game.moves[moveNumber]) {
    notFound(res);
    return;
  }
  res.send(game.moves[moveNumber]);
});

app.post('/games/:game_id([a-z0-9-]+)/moves/:move_id', (req, res) => {
  let gameId = req.params.game_id;
  let moveNumber = req.params.move_id * 1;
  let v = validation.validateMove(req.body);

  let game = store.loadGameObject(req.params.game_id);
  if (v.errors.length > 0 || (game && moveNumber !== game.moves.length)) {
    badRequest(res);
    return;
  }
  if (!game) {
    notFound(res);
    return;
  }

  let move = new Move(req.body.player, req.body.space.row, req.body.space.col);
  if (!game.isValid(move)) {
    badRequest(res, 'Invalid Move');
    return;
  }
  game.makeMove(move);
  store.saveGameObject(game);
});

app.listen(port, () => console.log(`Othello API listening at http://localhost:${port}`))
