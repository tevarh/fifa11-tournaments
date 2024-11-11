<!-- src/components/LoginComponent.vue -->
<template>
  <div>
    <button @click="signInWithGoogle">Sign in with Google</button>
  </div>
</template>

<script>
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
const ADMIN_EMAIL = "tevarhbrraikk@google.com"; // Replace with your admin email

export default {
  data() {
    return {
      user: null, // Store user data here
    };
  },
  methods: {
    async signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        this.user = result.user;
        this.user.isAdmin = this.user.email === ADMIN_EMAIL;
        console.log("User info:", this.user);
      } catch (error) {
        console.error("Sign-in error:", error);
      }
    }
  }
};

