<template>
    <div>
      <h2>Logged-in Users</h2>
      <ul>
        <li v-for="user in users" :key="user.uid">
          {{ user.displayName }} ({{ user.email }})
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import { db } from '../firebase'; // Impordi oma Firebase'i andmebaasi
  // import { ref, onMounted } from 'vue';
  
  export default {
    data() {
      return {
        users: [],
      };
    },
    onMounted() {
      this.loadUsers();
    },
    methods: {
      async loadUsers() {
        // Laadi kasutajad Firebase'i andmebaasist
        // (Muuda vastavalt oma andmebaasi struktuurile)
        const snapshot = await db.collection('users').get();
        this.users = snapshot.docs.map(doc => doc.data());
      },
    },
  };
  </script>
  