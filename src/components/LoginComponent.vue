<!-- src/components/LoginComponent.vue -->
<template>
  <div>
    <button @click="signInWithGoogle">Sign in with Google</button>
  </div>
</template>

<script>
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
const ADMIN_EMAIL = "tevarhbrraikk@google.com"; // Asenda oma admini e-posti aadressiga

export default {
  methods: {
    async signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        console.log("User info:", result.user); // This retrieves the user's information
        this.user.isAdmin = this.user.email === ADMIN_EMAIL;
      } catch (error) {
        console.error("Sign-in error:", error);
      }
    }
  }
};
</script>
