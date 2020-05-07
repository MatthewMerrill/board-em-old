const express = require('express');
const app = express();
const port = 3000

const GameTypes = require('./gameTypes.js');
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

// TODO: wrap moves to be able to be strict
app.use(express.json({strict:false}));

app.get('/', (req, res) => res.redirect('http://www.mattmerr.com'));

app.post('/games', (req, res) => {
  try {
    let {type} = req.body;
    let game = store.createGame(type);
    res.send(game);
  } catch (err) {
    console.error('Error creating game', err);
    badRequest(res);
  }
});

app.get('/games/:game_id([a-z0-9-]+)', (req, res) => {
  let gameInfo = store.getGame(req.params.game_id);
  if (gameInfo) {
    res.send(gameInfo);
  }
  else {
    notFound(res);
    return;
  }
});

app.get('/games/:game_id([a-z0-9-]+)/validMoves', (req, res) => {
  let game = store.loadGameObject(req.params.game_id);
  if (!game) {
    notFound(res);
    return;
  }

  let moves = game.board.validMoves(game.currentPlayer());
  let withRenders = moves.map(move => {
    let board = game.board.clone();
    board.applyMove(move);
    return {move: move.toString(), board: board.state, render: board.toString()};
  });
  res.send(withRenders);
});


app.get('/games/:game_id([a-z0-9-]+)/moves/:move_id(\\d+)', (req, res) => {
  let gameId = req.params.game_id;
  let moveNumber = req.params.move_id * 1;
  
  // Doing the ! > -1 catches NaN
  if (!(moveNumber > -1)) {
    badRequest(res);
    return;
  }
  let game = store.loadGameObject(req.params.game_id);
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
  if (/*v.errors.length > 0 ||*/ (game && moveNumber !== game.moves.length)) {
    badRequest(res);
    return;
  }
  if (!game) {
    notFound(res);
    return;
  }

  // TODO: determine player movability and stuff or something idk
  //let move = new Move(req.body.player, req.body.space.row, req.body.space.col);
  let {Move} = GameTypes.getType(game.type);
  let move = Move.fromString(game.moves.length % 2 + 1, req.body);
  if (!game.isValid(move)) {
    badRequest(res, 'Invalid Move');
    return;
  }
  game.makeMove(move);
  store.saveGameObject(game);
  res.sendStatus(200);
});

app.listen(port, () => console.log(`Othello API listening at http://localhost:${port}`))
