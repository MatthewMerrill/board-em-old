<template>
  <div id="game">
    <span v-if="errormsg" id="errormsg">{{errormsg}}</span>
    <div v-if="!board" id="game-id-entry">
      <label>
        <strong>Enter a Game ID to begin:</strong>&nbsp;
        <input v-on:input="errormsg=null" v-model="id" type="text" />
        <br>
      </label>
      <button v-bind:disabled="!id" v-on:click="join(0)">Join as Player 1</button>
      <button v-bind:disabled="!id" v-on:click="join(1)">Join as Player 2</button>
      <button v-bind:disabled="!id" v-on:click="join(2)">Join as Both Players</button>
      <br/>
      <select v-bind:disabled="!!id" v-model="gameType">
        <option value="othello">Othello</option>
        <option value="connect4">Connect 4</option>
      </select>
      <button v-bind:disabled="!!id" v-on:click="create()">Create Game</button>
    </div>
    <div v-if="board" class="game-view">
      <div class="button-row">
        <button v-if="!idVisible" v-on:click="idVisible=true">Show Game ID</button>
        <button v-if="idVisible" v-on:click="idVisible=false">Hide Game ID</button>
        <button v-on:click="leave()">Leave Game</button>
        <br>
        <input readonly v-if="idVisible" v-model="id">
      </div>
      <hr>
      <div class="button-row">
        <button v-bind:disabled="!id" v-on:click="setPlayer(0)">Play as Player 1</button>
        <button v-bind:disabled="!id" v-on:click="setPlayer(1)">Play as Player 2</button>
        <button v-bind:disabled="!id" v-on:click="setPlayer(2)">Play as Both Players</button>
      </div>
      <pre v-if="displayedMove === null">{{board}}</pre>
      <pre v-if="displayedMove !== null">{{validMoves[displayedMove].render}}</pre>
      <div id="move-list">
        <div><strong>History:</strong></div>
        <div v-for="move in moves" :key="move.move">
          <div class="move-token">{{move}}&nbsp;</div>
        </div>
      </div>
      <hr>
      <div id="move-list">
        <div v-for="(moveOption, index) in validMoves" :key="moveOption.move">
          <button v-if="(1 - moves.length % 2) != playerId"
                  v-on:click="makeMove(moveOption.move)"
                  @mouseover="displayedMove=index"
                  @mouseout="displayedMove=null">{{moveOption.move}}</button>
          <span class="move-token" v-if="(1 - moves.length % 2) == playerId"
                  @mouseover="displayedMove=index"
                  @mouseout="displayedMove=null">{{moveOption.move}}</span>
        </div>
      </div>
    </div>
    <audio id="chime" type="audio/wav" src="398661__psykoosiossi__chime_small.wav"></audio>
  </div>
</template>

<script>
export default {
  name: 'Game',
  data: () => ({
    id: null,
    idVisible: false,
    gameType: 'othello',
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
        location.hash = this.id;
        history.pushState(location.href, 'In Game');
        this.setPlayer(playerId);
        this.pollUpdate();
      } catch (err) {
        this.errormsg = 'Unable to connect to game with that ID.';
        console.error(err);
      }
    },

    leave() {
      this.idVisible = false;
      this.moves = null;
      this.board = null;
      this.errormsg = null;
      this.validMoves = null;
      this.displayedMove = null;
      this.playerId = -1;
      this.playerName = 'Unknown Player';
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    },

    async create() {
      let res = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: this.gameType, }),
      });
      if (!res.ok) {console.error(res); return;}
      let body = await res.json();
      console.log(body);
      this.id = body.id;
      location.hash = body.id;
    },

    setPlayer(playerId) {
        this.playerId = playerId;
        this.playerName = ['Player 1', 'Player 2', 'Both Players'][playerId];
    },

    pollUpdate() {
      if (this.validMoves !== null && this.validMoves.length === 0) {
        this.errormsg = 'Game Over!';
        return;
      }
      this.timeoutId = setTimeout(async () => {
        try {
          await this.fetchGame();
          this.pollUpdate();
        } catch (err) {
          console.error(err);
          this.errormsg = 'An error occurred while attempting to load updates. Please refresh the page.';
          //this.pollUpdate();
        }
      }, 1000);
    },

    async fetchGame(id) {
      try {
        let res = await fetch('/api/games/' + (id || this.id));
        if (!res.ok) {console.error(res); return false;}
        let body = await res.json();
        if (this.moves == null || body.moves.length != this.moves.length) {
          document.getElementById('chime').play();
          await this.updateGame(body);
          await this.fetchValidMoves();
        }
        return true;
      } catch (err) {
        console.error(err)
        return false;
      }
    },

    updateGame(game) {
      let {moves, render: board} = game;
      this.moves = moves;
      this.board = board;
      this.displayedMove = null;
      this.errormsg = null;
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

.button-row {
  text-align: center;
}

#errormsg {
  display: block;
  color: red;
  font-weight: bold;
  max-width: 40ch;
  text-align: center;
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
.move-token {
  display: inline-block;
  border: 1px solid #ccc;
  margin: 0 1px;
  padding: 0 2px;
}
</style>

