<template>
  <div>
    <!-- Loading Spinner -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
    </div>

    <h1>{{ tournament.name }}</h1>
    <p>Type: {{ tournament.type }}</p>
    <p>Status: {{ tournament.status || "Upcoming" }}</p>
    <p>Format: {{ tournament.teamSize === 1 ? "1v1" : "2v2" }}</p>
    <p>Players: {{ registrations.length }}/{{ tournament.maxPlayers }}</p>

    <!-- Registration form -->
    <div v-if="user && !isTournamentFull && !isRegistered">
      <h3>Team Information</h3>
      <form @submit.prevent="registerForTournament">
        <div class="form-group">
          <label for="teamName">Team Name:</label>
          <input
            type="text"
            v-model="teamName"
            id="teamName"
            required
            placeholder="Enter your team name"
            class="form-control"
          />
        </div>
        <div v-if="tournament.teamSize === 2" class="form-group">
          <label for="teammateUsername">Teammate's Username:</label>
          <input
            type="text"
            v-model="teammateUsername"
            id="teammateUsername"
            placeholder="Enter your teammate's username (optional)"
            class="form-control"
          />
        </div>
        <button type="submit" class="btn btn-primary mt-3">Register</button>
      </form>
    </div>

    <!-- Registered message and update/unregister options -->
    <div v-if="user && isRegistered">
      <div v-if="isCaptain">
        <p><b>You are registered as Captain of the team!</b></p>
      </div>
      <div v-else>
        <p><b>You are registered as teammate!</b></p>
      </div>
      <button @click="unregisterFromTournament" class="btn btn-danger mt-3">Unregister</button>
      <button @click="updateRegistration" class="btn btn-success mt-3" v-if="isCaptain">Update Registration</button>
    </div>

    <h2>Registered Players</h2>
    <table class="table table-dark table-striped">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Captain</th>
          <th scope="col">Team Name</th>
          <th scope="col">Teammate</th>
          <th scope="col">Registration Time</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(registration, index) in registrations" :key="registration.id">
          <td>{{ index + 1 }}</td>
          <td>{{ registration.playerName }}</td>
          <td>{{ registration.teamName }}</td>
          <td>
            <button
              v-if="!isRegistered && !registration.teammateUsername"
              @click="assignToTeam(registration.id)"
              class="btn btn-outline-light btn-sm"
            >
              Open Spot
            </button>
            <span v-else>{{ registration.teammateUsername || 'Open Spot' }}</span>
          </td>
          <td>{{ formatTimestamp(registration.registeredAt) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

export default {
  props: {
    isAdmin: Boolean,
    globalUser: Object,
    username: String,
    gameRangerId: String,
    discordUser: String,
  },
  data() {
    return {
      loading: false,
      tournament: {},
      user: null,
      isRegistered: false,
      isCaptain: false,
      registrations: [],
      teamName: '',
      teammateUsername: '',
      registrationDocId: null,
    };
  },
  mounted() {
    console.log('SHOW THIS TO CONSOLE!!!')
    console.log('And username is $this.username' % this.username)
  },
  async created() {
    this.loading = true;
    try {
      const tournamentID = this.$route.params.tournamentID;
      const docRef = doc(db, "tournaments", tournamentID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.tournament = docSnap.data();
      }
      await this.loadRegistrations();
      onAuthStateChanged(auth, (user) => {
        this.user = user;
        if (user) {
          this.checkRegistration();
        }
      });
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async checkRegistration() {
      if (this.user) {
        this.loading = true;
        try {
          const registrationRef = collection(db, "tournaments", this.$route.params.tournamentID, "registrations");
          const snapshot = await getDocs(registrationRef);

          this.isRegistered = false;
          this.isCaptain = false;

          snapshot.forEach((doc) => {
            const registration = doc.data();
            if (registration.playerName === this.username || registration.teammateUsername === this.username) {
              this.isRegistered = true;
              this.registrationDocId = doc.id;
              this.teamName = registration.teamName || '';
              this.teammateUsername = registration.teammateUsername || '';
            }
            if (registration.playerName === this.username) {
              this.isCaptain = true;
            }
          });
        } finally {
          this.loading = false;
        }
      }
    },
    async registerForTournament() {
      this.loading = true;
      try {
        const registrationRef = collection(db, "tournaments", this.$route.params.tournamentID, "registrations");
        await addDoc(registrationRef, {
          userId: this.user.uid,
          playerName: this.username,
          teamName: this.teamName,
          teammateUsername: this.teammateUsername,
          registeredAt: new Date()
        });
        this.isRegistered = true;
        this.isCaptain = true;
        alert("Registered successfully!");
        // Reload registrations and refresh registration status
        await this.loadRegistrations();
        await this.checkRegistration();
      } finally {
        this.loading = false;
      }
    },
    async assignToTeam(registrationId) {
      this.loading = true;
      try {
        const registrationDocRef = doc(db, "tournaments", this.$route.params.tournamentID, "registrations", registrationId);
        await updateDoc(registrationDocRef, {
          teammateUsername: this.username
        });
        alert("Assigned to team successfully!");
        this.isRegistered = true;
        await this.loadRegistrations();
      } finally {
        this.loading = false;
      }
    },
    async updateRegistration() {
      if (this.registrationDocId) {
        this.loading = true;
        try {
          const registrationDocRef = doc(db, "tournaments", this.$route.params.tournamentID, "registrations", this.registrationDocId);
          await updateDoc(registrationDocRef, {
            teamName: this.teamName,
            teammateUsername: this.teammateUsername
          });
          alert("Registration updated successfully!");
          // Reload registrations and refresh registration status
          await this.loadRegistrations();
          await this.checkRegistration();
        } finally {
          this.loading = false;
        }
      }
    },
    async unregisterFromTournament() {
      if (this.registrationDocId) {
        this.loading = true;
        try {
          const registrationDocRef = doc(db, "tournaments", this.$route.params.tournamentID, "registrations", this.registrationDocId);
          if (this.isCaptain) {
            await deleteDoc(registrationDocRef);
            this.isRegistered = false;
            this.registrationDocId = null;
            this.isCaptain = false;
            alert("Unregistered successfully as captain!");
          } else {
            await updateDoc(registrationDocRef, {
              teammateUsername: null
            });
            this.isRegistered = false;
            alert("Unregistered successfully as teammate!");
          }
          // Reload registrations and refresh registration status
          await this.loadRegistrations();
          await this.checkRegistration();
        } finally {
          this.loading = false;
        }
      }
    },
    async loadRegistrations() {
      this.loading = true;
      try {
        const registrationsRef = collection(db, "tournaments", this.$route.params.tournamentID, "registrations");
        const registrationsSnap = await getDocs(registrationsRef);
        this.registrations = registrationsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } finally {
        this.loading = false;
      }
    },
    formatTimestamp(timestamp) {
      const date = timestamp.toDate();
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  }
};
</script>

<style scoped>
/* Loading overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.spinner {
  border: 8px solid rgba(255, 255, 255, 0.2);
  border-top: 8px solid white;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 0.8s linear infinite;
}

.tournament-detail {
  color: white;
}
</style>
