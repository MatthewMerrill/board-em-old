<template>
  <div id="app">
    <h1 class="title">My Board Game Hub Project</h1>
    <Game class="shadowed lightpad"></Game>
  </div>
</template>

<script>
import Game from './components/Game';

export default {
  name: 'App',
  components: {
    Game,
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1.title {
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.shadowed {
  box-shadow: 2px 2px 5px black;
}

.lightpad {
  padding: 1ch;
}
</style>
