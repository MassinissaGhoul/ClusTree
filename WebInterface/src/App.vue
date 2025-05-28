<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Container principal propre -->
    <RouterView />
  </div>
</template>


<style>
/* Styles globaux si nécessaire */
#app {
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>