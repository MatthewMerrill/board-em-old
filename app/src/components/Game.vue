<template>
  <div id="game">
    <div v-if="!board" id="game-id-entry">
      <label>
        <span v-if="errormsg" id="errormsg">{{errormsg}}</span>
        <strong>Enter a Game ID to begin:</strong>&nbsp;
        <input v-on:input="errormsg=null" v-model="id" type="text" />
        <br>
      </label>
      <button v-bind:disabled="!id" v-on:click="join(0)">Join as Player 1</button>
      <button v-bind:disabled="!id" v-on:click="join(1)">Join as Player 2</button>
      <button v-bind:disabled="!id" v-on:click="join(2)">Join as Both Players</button>
    </div>
    <div v-if="board" class="game-view">
      <button v-bind:disabled="!id" v-on:click="setPlayer(0)">Play as Player 1</button>
      <button v-bind:disabled="!id" v-on:click="setPlayer(1)">Play as Player 2</button>
      <button v-bind:disabled="!id" v-on:click="setPlayer(2)">Play as Both Players</button>
      <pre v-if="displayedMove === null">{{board}}</pre>
      <pre v-if="displayedMove !== null">{{validMoves[displayedMove].board}}</pre>
      <div id="move-list">
        <div><strong>History:</strong></div>
        <div v-for="move in moves" :key="move.move">
          <div class="history-move">{{move}}&nbsp;</div>
        </div>
      </div>
      <hr>
      <div id="move-list">
        <div v-for="(moveOption, index) in validMoves" :key="moveOption.move">
          <button v-on:click="makeMove(moveOption.move)"
             v-bind:disabled="(1 - moves.length % 2) == playerId"
             @mouseover="displayedMove=index"
             @mouseout="displayedMove=null">{{moveOption.move}}</button>
        </div>
      </div>
    </div>
    <audio id="chime" type="audio/wav" src="398661__psykoosiossi__chime_small.wav"></audio>_
  </div>
</template>

<script>
export default {
  name: 'Game',
  data: () => ({
    id: null,
    moves: null,
    board: null,
    errormsg: null,
    validMoves: null,
    displayedMove: null,
    playerId: -1,
    playerName: 'Unknown Player',
    timeoutId: null,
  }),
  methods: {
    async join(playerId) {
      try {
        let worked = await this.fetchGame();
        if (!worked) throw new Error();
        this.setPlayer(playerId);
        this.pollUpdate();
      } catch (err) {
        this.errormsg = 'Unable to connect to game with that ID.';
        console.error(err);
      }
    },

    setPlayer(playerId) {
        this.playerId = playerId;
        this.playerName = ['Player 1', 'Player 2', 'Both Players'][playerId];
    },

    pollUpdate() {
      this.timeoutId = setTimeout(async () => {
        try {
          let res = await fetch(`/api/games/${this.id}/moves/${this.moves.length}`);
          if (res.ok) {
            document.getElementById('chime').play();
            this.fetchGame();
          }
          this.pollUpdate();
        } catch (err) {
          console.error(err);
          this.pollUpdate();
        }
      }, 1000);
    },

    async fetchGame(id) {
      try {
        let res = await fetch('/api/games/' + (id || this.id));
        if (!res.ok) {console.error(res); return false;}
        let body = await res.json();
        this.updateGame(body);
        return true;
      } catch (err) {
        console.error(err)
        return false;
      }
    },

    updateGame(game) {
      let {moves, board} = game;
      this.moves = moves;
      this.board = board;
      this.fetchValidMoves();
    },

    async fetchValidMoves() {
      let res = await fetch('/api/games/' + this.id + '/validMoves');
      if (!res.ok) { throw Error(res); }
      let body = await res.json();
      this.validMoves = body;
    },

    async makeMove(move) {
      let res = await fetch('/api/games/' + this.id + '/moves/' + this.moves.length, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(move),
      });
      if (!res.ok) throw new Error();
      this.fetchGame();
    }
  },
  mounted() {
    if (location.hash.length > 1) {
      this.id = location.hash.substr(1);
    }
    console.log(this);
  }
}
</script>

<style scoped>
#game-id-entry {
  text-align: center;
  color: #2c3e50;
}

#errormsg {
  display: block;
  color: red;
  font-weight: bold;
}

pre {
  text-align: center;
  font-weight: bold;
}

#move-list {
  font-family: monospace;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 30ch;
}
.history-move {
  display: inline-block;
  border: 1px solid #ccc;
  margin: 0 1px;
  padding: 0 2px;
}
</style>

