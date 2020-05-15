<template>
  <div id="app">
    <div>
      <h1 class="title">Board 'Em</h1>
      <h6 class="subtitle">Perfect Information Board Games</h6>
    </div>
    <Game class="shadowed lightpad"></Game>
    <div id="byline" class="shadowed lightpad">
      Matthew Merrill 2020
      <a href="https://www.mattmerr.com">mattmerr.com</a></div>
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
  margin: 10px 0 0 0;
}
h6.subtitle {
  text-align: center;
  color: #000000;
  margin: 0 2px 2px 2px;
}

#app > * {
  box-shadow: 2px 2px 5px black;
  padding: 1ch;
  margin: 15px 0 0 5px;
}
</style>
