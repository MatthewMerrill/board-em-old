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
       <div v-for="(moveOption, index) in validMoves" :key="moveOption.move">
         <button v-on:click="makeMove(moveOption.move)"
            v-bind:disabled="(1 - moves.length % 2) == playerId"
           @mouseover="displayedMove=index"
           @mouseout="displayedMove=null">{{moveOption.move}}</button>
       </div>
     </div>
   </div>
  </div>
</template>

<script>
export default {
  name: 'Game',
  props: {
  },
  data: () => ({
    id: null,
    moves: null,
    board: null,
    errormsg: null,
    validMoves: null,
    displayedMove: null,
    playerId: -1,
    playerName: 'Unknown Player',
  }),
  methods: {
    async join(playerId) {
      try {
        let worked = await this.fetchGame();
        if (!worked) throw new Error();
        this.setPlayer(playerId);
      } catch {
        this.errormsg = 'Unable to connect to game with that ID.';
        console.log('err');
      }
    },

    setPlayer(playerId) {
        this.playerId = playerId;
        this.playerName = ['Player 1', 'Player 2', 'Both Players'][playerId];
    },

    async fetchGame(id) {
      try {
        let res = await fetch('/api/games/' + (id || this.id));
        if (!res.ok) return false;
        let body = await res.json();
        this.updateGame(body);
      } catch {
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
      if (!res.ok) { throw Error(); }
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
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 30ch;
}
</style>

