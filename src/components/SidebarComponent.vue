<!-- src/components/SidebarComponent.vue -->
<template>
    <nav class="sidebar">
      <ul>
        <li><router-link to="/">{{ $t("home") }}</router-link></li>
        <li>
          <router-link to="/tournaments">{{ $t("tournaments") }}</router-link>
          <ul><li v-if="isAdmin"><router-link to="/tournaments/create">Create Tournament</router-link></li></ul>
        </li>
        <!-- Show Users link only if the user is admin -->
      <li v-if="isAdmin"><router-link to="/users">Users</router-link></li>
      </ul>
    </nav>
  </template>
  
<script>
export default {
  props: {
    isAdmin: {
      type: Boolean,
      required: true,
    },
  },
}; 
</script>