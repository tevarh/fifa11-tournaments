<!-- src/App.vue -->
<template>
  <div id="app">
    <header class="header">
      <h1>FIFA11 Tournaments</h1>
      <div class="user-info">
        <button v-if="!user" class="login-button" @click="signInWithGoogle">
          <img src="@/images/google-icon.png" alt="Google Icon" class="google-icon" />
          Sign in with Google
        </button>
        <div v-else class="logged-in-info">
          <img :src="user.photoURL" alt="User Avatar" class="avatar" />
          <span>Welcome, {{ user.displayName }}</span>
          <button class="logout-button" @click="signOut">Sign out</button>
          <!-- Admin navigation link -->
          <router-link v-if="user.isAdmin" to="/users">Users</router-link>
        </div>
      </div>
    </header>

    <div class="layout">
      <SidebarComponent />
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import './App.css';
import SidebarComponent from './components/SidebarComponent.vue';
import { auth } from './firebase';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

export default {
  components: {
    SidebarComponent,
  },
  data() {
    return {
      user: null,
    };
  },
  created() {
    onAuthStateChanged(auth, (user) => {
      this.user = user;
    });
  },
  methods: {
    async signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        this.user = result.user;
      } catch (error) {
        console.error("Sign-in error:", error);
      }
    },
    async signOut() {
      await signOut(auth);
      this.user = null;
    },
  },
};
</script>
