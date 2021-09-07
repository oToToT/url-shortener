<script setup>
import Config from '../Config.js'
</script>

<template lang="pug">
nav.navbar.navbar-dark.mb-auto
  .container
    a.navbar-brand.h1.mb-0(href='/') Dve.Tw
    button.btn.btn-outline-warning(@click='reportBug') 回報Bug
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

nav {
  .navbar-brand {
    color: #fff;
    font-size: 2em;
    font-family: 'Indie Flower', cursive;
  }
}
</style>
