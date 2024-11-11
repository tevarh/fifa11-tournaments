<template>
  <div class="tournaments-content">
    <h2>Logged-In Users ({{ loggedInUsers.length }})</h2>
    <ul>
      <li v-for="user in loggedInUsers" :key="user.uid">
        {{ user.displayName }} ({{ user.email }}) - Last Login: {{ formatDate(user.lastLogin) }}
      </li>
    </ul>

    <h2>Logged-Out Users ({{ loggedOutUsers.length }})</h2>
    <ul>
      <li v-for="user in loggedOutUsers" :key="user.uid">
        {{ user.displayName }} ({{ user.email }}) - Last Logout: {{ formatDate(user.lastLogout) }}
      </li>
    </ul>
  </div>
</template>
  
  <script>
  import { db } from '../firebase'; // Impordi oma Firebase'i andmebaasi
  import { collection, query, where, onSnapshot } from "firebase/firestore";
  
  export default {
    data() {
      return {
        loggedInUsers: [],
        loggedOutUsers: [],
      };
    },
    async mounted() {
      this.loadUsers();
    },
    methods: {
      async loadUsers() {
        const usersCollection = collection(db, "users");

        // Query for Logged-In Users
        const loggedInQuery = query(usersCollection, where("status", "==", "online"));
        onSnapshot(loggedInQuery, (snapshot) => {
          this.loggedInUsers = snapshot.docs.map(doc => doc.data());
        });

        // Query for Logged-Out Users
        const loggedOutQuery = query(usersCollection, where("status", "==", "offline"));
        onSnapshot(loggedOutQuery, (snapshot) => {
          this.loggedOutUsers = snapshot.docs.map(doc => doc.data());
        });
      },
      // Format date to 24-hour format
      formatDate(timestamp) {
        if (!timestamp) return ""; // Handle empty or undefined timestamps
        return timestamp.toDate().toLocaleString("en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        });
      },
    },
  };
  </script>
  