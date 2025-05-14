<template>
  <div id="app">
    <h1>Chat Statistics Dashboard</h1>
    <StatsViewer />
  </div>
</template>

<script>
import StatsViewer from './components/StatsViewer.vue';

export default {
  name: 'App',
  components: {
    StatsViewer,
  },
};
</script>

<style scoped>
#app {
  min-height: 100vh;
  background: linear-gradient(180deg, #0a0a1a, #1a2a3a);
  padding: 40px 20px;
  text-align: center;
}

h1 {
  color: #00ffcc;
  text-shadow: 0 0 15px rgba(0, 255, 204, 0.7);
  font-size: 3rem;
  margin-bottom: 40px;
  text-transform: uppercase;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    text-shadow: 0 0 15px rgba(0, 255, 204, 0.7);
  }
  50% {
    text-shadow: 0 0 25px rgba(0, 255, 204, 1);
  }
  100% {
    text-shadow: 0 0 15px rgba(0, 255, 204, 0.7);
  }
}
</style>