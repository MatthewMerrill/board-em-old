# Contributing

Thank you for reading this guide on contributing!

## Code Standards

Write JavaScript using 2 spaces for indentation. Follow precendents whereever you can find them. Comments, variables, methods, etc must be descriptive, semi-formal English. Humor is appreciated, vulgar language is not.

## Hacktoberfest

If you are here for hacktoberfest, the main area I would most appreciate PRs is adding games to the JavaScript server stack/website. There are also some PRs from Dependabot that I really *should* merge, but if you would like to re-make those PRs **TO ADDRESS A SECURITY VULNERABILITY** I will happily approve yours over Dependabot's.

### Adding a game

1. Create a file called <gamename>.js and read through [connect4.js](https://github.com/MatthewMerrill/board-em/blob/master/connect4.js) for a sense of the structure.
1. Write out the game logic, starting with the skeleton code provided below. Try to break stuff into helpers as much as is reasonable for readability. Othello and Connect4 provide good examples of how far to go with helper methods.
1. Register the game type in [gameTypes.js](https://github.com/MatthewMerrill/board-em/blob/master/gameTypes.js) at the top with the others.
1. Test out the game! If you correctly implement the skeleton as outlined below, the game should automatically work for keeping track of turns, etc.

#### Game Structure

```javascript
class Game {
  constructor(id, skipInit) { /* IMPLEMENT ME */ }

  currentPlayer() { /* IMPLEMENT ME */ }

  isValid(move) { /* IMPLEMENT ME */ }
  
  makeMove(move) { /* IMPLEMENT ME */ }
}
module.exports.Game = Game;

class Board {
  constructor() { /* IMPLEMENT ME */ }

  init() { /* IMPLEMENT ME */ }

  clone() { /* IMPLEMENT ME */ }

  applyMove(move) { /* IMPLEMENT ME */ } 

  validMoves(player, disregardPass) { /* IMPLEMENT ME */ }

  toString() { /* IMPLEMENT ME */ }
}
module.exports.Board = Board;

class Move {
  toString() { /* IMPLEMENT ME */ }
}
Move.fromString = function(player, s) { /* IMPLEMENT ME */ }

module.exports.Move = Move;
```
