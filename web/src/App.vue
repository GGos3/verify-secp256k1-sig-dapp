<script setup>

</script>

<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/VerifySignaturePage">VerifySignature Test</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<style scoped>
nav {
  margin-bottom: 20px;
}

nav a {
  margin-right: 10px;
}
</style>
