const GameTypes = {
  othello: require('./othello'),
  connect4: require('./connect4'),
};
module.exports = {
  getType(gameType) {
    if (!GameTypes.hasOwnProperty(gameType)) {
      throw Error('Invalid Game Type');
    }
    return GameTypes[gameType];
  },
}
