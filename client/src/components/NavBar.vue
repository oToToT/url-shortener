<script setup>
import Config from '../Config.js'
</script>

<template lang="pug">
nav.site-nav
  .nav-inner
    a.nav-brand(href='/') Dve.Tw
    button.bug-button(@click='reportBug') 回報Bug
</template>

<script>
export default {
  name: 'NavBar',
  methods: {
    reportBug: Config.reportBug
  }
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap');

.site-nav {
  margin-bottom: auto;
}

.nav-inner {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 960px;
  width: 100%;
}

.nav-brand {
  color: #fff;
  font-family: 'Indie Flower', cursive;
  font-size: 2em;
  text-decoration: none;
}

.bug-button {
  background: transparent;
  border: 1px solid #ffc107;
  border-radius: 0.5rem;
  color: #ffc107;
  cursor: pointer;
  padding: 0.55rem 0.95rem;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.bug-button:hover {
  background: rgba(255, 193, 7, 0.12);
}

@media (max-width: 640px) {
  .nav-inner {
    gap: 1rem;
  }
}
</style>
