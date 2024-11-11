<template>
  <div id="app">
    <header class="header">
      <h1>FIFA 11 League</h1>
      <div class="user-info">
        <select v-model="$i18n.locale" class="language-selector">
          <option value="en">English</option>
          <option value="ru">Русский</option>
        </select>
        <button v-if="!user" class="login-button" @click="signInWithGoogle">
          <img src="@/images/google-icon.png" alt="Google Icon" class="google-icon" />
          {{ $t("signIn") }}
        </button>
        <div v-else class="logged-in-info">
          <span v-if="isAdmin" class="admin-badge">🌟 Admin</span>
          <img :src="user.photoURL" alt="User Avatar" class="avatar" />
          <span @click="showProfilePopup = true" class="clickable-name">{{ $t("welcome") }}, {{ user.displayName }}</span>
          <button class="logout-button" @click="signOut">{{ $t("signOut") }}</button>
        </div>
      </div>
    </header>

    <!-- Popup for updating user attributes -->
    <div v-if="showInfoPopup || showProfilePopup" class="popup-overlay">
      <div class="popup-content">
        <h2>Complete Your Profile</h2>
        <form @submit.prevent="saveUserDetails">
          <div class="form-group">
            <label for="username">Username:</label>
            <input v-model="username" id="username" required class="form-control" />
          </div>
          <div class="form-group">
            <label for="gameRangerId">GameRanger ID:
              <span class="question-icon" @click="toggleGamerangerHelp">❓</span>
            </label>
            <input v-model="gameRangerId" id="gameRangerId" required class="form-control" />
            <div v-if="showGamerangerHelp" class="help-image">
              <img src="@/images/gameranger.png" alt="GameRanger ID help" />
            </div>
          </div>
          <div class="form-group">
            <label for="discordUser">Discord User:</label>
            <input v-model="discordUser" id="discordUser" required class="form-control" />
          </div>
          <div class="form-buttons">
            <button type="submit" class="btn btn-primary">Save</button>
            <button 
              type="button" 
              v-if="cancelTrue === 'Y'" 
              @click="cancelEdit" 
              class="btn btn-secondary"
            >Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <div class="layout">
      <SidebarComponent :is-admin="isAdmin" />
      <main class="content">
        <router-view v-slot="{ Component }">
          <component :isAdmin="isAdmin" :is="Component" />
        </router-view>
      </main>
    </div>
  </div>
</template>

<script>
import './App.css';
import SidebarComponent from './components/SidebarComponent.vue';
import { auth, db } from './firebase';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const ADMIN_EMAILS = process.env.VUE_APP_ADMIN_EMAILS.split(',');

export default {
  components: {
    SidebarComponent,
  },
  data() {
    return {
      user: null,
      isAdmin: false,
      showInfoPopup: false,
      showProfilePopup: false,
      username: '',
      gameRangerId: '',
      discordUser: '',
      cancelTrue: 'N',
      showGamerangerHelp: false,
    };
  },
  created() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.user = user;
        this.isAdmin = ADMIN_EMAILS.includes(user.email);
        await this.checkUserProfile();
      }
    });
  },
  methods: {
    async checkUserProfile() {
      if (!this.user) return; // Do not proceed if user is not logged in

      const userRef = doc(db, 'users', this.user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        this.username = data.username || '';
        this.gameRangerId = data.gameRangerId || '';
        this.discordUser = data.discordUser || '';

        // Set cancelTrue based on existing data
        if (this.username && this.gameRangerId && this.discordUser) {
          this.cancelTrue = 'Y';
        } else {
          this.cancelTrue = 'N';
        }

        // Show popup if any field is missing
        if (!this.username || !this.gameRangerId || !this.discordUser) {
          this.showInfoPopup = true;
        }
      } else {
        // Show popup if no document exists and set cancelTrue to 'N'
        this.cancelTrue = 'N';
        this.showInfoPopup = true;
      }
    },
    async saveUserDetails() {
      const userRef = doc(db, 'users', this.user.uid);
      await setDoc(userRef, {
        username: this.username,
        gameRangerId: this.gameRangerId,
        discordUser: this.discordUser,
      }, { merge: true });
      this.showInfoPopup = false;
      this.showProfilePopup = false;
      this.cancelTrue = 'Y';
      alert('Profile updated successfully!');
    },
    cancelEdit() {
      this.showInfoPopup = false;
      this.showProfilePopup = false;
    },
    toggleGamerangerHelp() {
      this.showGamerangerHelp = !this.showGamerangerHelp;
    },
    async signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        this.user = result.user;
        this.isAdmin = ADMIN_EMAILS.includes(result.user.email);
        await this.checkUserProfile(); // Check for missing fields after login
      } catch (error) {
        console.error('Sign-in error:', error);
      }
    },
    async signOut() {
      try {
        await signOut(auth);
        this.user = null;
        this.isAdmin = false;
        location.reload(); // Refresh the page after sign out
      } catch (error) {
        console.error('Sign-out error:', error);
      }
    },
  },
};
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 100%;
}

.form-group {
  margin-bottom: 15px;
}

.clickable-name {
  cursor: pointer;
  text-decoration: underline;
}

.form-buttons {
  display: flex;
  justify-content: space-between;
}

.question-icon {
  margin-left: 5px;
  cursor: pointer;
}

.help-image {
  margin-top: 10px;
}

.help-image img {
  max-width: 100%;
  border-radius: 5px;
}
</style>
