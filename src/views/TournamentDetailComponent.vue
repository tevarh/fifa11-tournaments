<template>
  <div>
    <h1>{{ tournament.name }}</h1>
    <p>Type: {{ tournament.type }}</p>
    <p>Status: {{ tournament.status || "Upcoming" }}</p>
    <p>Format: {{ tournament.teamSize === 1 ? "1v1" : "2v2" }}</p>
    <p>Players: {{ registrations.length }}/{{ tournament.maxPlayers }}</p>
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

    <div v-if="user && isRegistered">
      <p>You are registered for this tournament.</p>
      <h3>Update Team Information</h3>
      <form @submit.prevent="updateRegistration">
        <div class="form-group">
          <label for="teamName">Team Name:</label>
          <input
            type="text"
            v-model="teamName"
            id="teamName"
            required
            class="form-control"
          />
        </div>
        <div v-if="tournament.teamSize === 2" class="form-group">
          <label for="teammateUsername">Teammate's Username:</label>
          <input
            type="text"
            v-model="teammateUsername"
            id="teammateUsername"
            class="form-control"
          />
        </div>
        <button type="submit" class="btn btn-success mt-3">Update Registration</button>
      </form>
      <button @click="unregisterFromTournament" class="btn btn-danger mt-3">Unregister</button>
    </div>

    <div v-if="!user">
      <p>Please sign in to register for this tournament.</p>
    </div>

    <h2>Registered Players</h2>
    <table class="table table-dark table-striped">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Player Name</th>
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
import { doc, getDoc, collection, addDoc, getDocs, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

export default {
  data() {
    return {
      tournament: {},
      user: null,
      isRegistered: false,
      registrations: [],
      teamName: '', // Team name for registration
      teammateUsername: '', // Teammate's username for 2v2 tournaments
      registrationDocId: null // Stores the registration document ID
    };
  },
  async created() {
    const tournamentID = this.$route.params.tournamentID;
    
    // Fetch tournament details
    const docRef = doc(db, "tournaments", tournamentID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      this.tournament = docSnap.data();
    }
    this.loadRegistrations();
    // Check authentication status and registration
    onAuthStateChanged(auth, (user) => {
      this.user = user;
      if (user) {
        this.checkRegistration();
      }
    });
  },
  computed: {
    // Check if tournament is full
    isTournamentFull() {
      return this.registrations.length >= this.tournament.maxPlayers;
    }
  },
  methods: {
    // Check if the user is already registered
    async checkRegistration() {
      if (this.user) {
        const registrationRef = collection(db, "tournaments", this.$route.params.tournamentID, "registrations");
        const registeredQuery = query(registrationRef, where("userId", "==", this.user.uid));
        const registeredSnapshot = await getDocs(registeredQuery);
  
        if (!registeredSnapshot.empty) {
          this.isRegistered = true;
          const registration = registeredSnapshot.docs[0].data();
          this.registrationDocId = registeredSnapshot.docs[0].id; // Store doc ID for unregistering
          this.teamName = registration.teamName;
          this.teammateUsername = registration.teammateUsername || '';
        }
      }
    },
    // Register user for the tournament
    async registerForTournament() {
      const registrationRef = collection(db, "tournaments", this.$route.params.tournamentID, "registrations");
      await addDoc(registrationRef, {
        userId: this.user.uid,
        playerName: this.user.displayName,
        teamName: this.teamName,
        teammateUsername: this.teammateUsername,
        registeredAt: new Date()
      });
      this.isRegistered = true;
      alert("Registered successfully!");
      this.loadRegistrations(); // Refresh registrations after registration
    },
    // Assign user to an open spot in a team
    async assignToTeam(registrationId) {
      const registrationDocRef = doc(db, "tournaments", this.$route.params.tournamentID, "registrations", registrationId);
      await updateDoc(registrationDocRef, {
        teammateUsername: this.user.displayName
      });
      alert("Assigned to team successfully!");
      this.isRegistered = true;
      this.loadRegistrations();
    },
    // Update existing registration
    async updateRegistration() {
      if (this.registrationDocId) {
        const registrationDocRef = doc(db, "tournaments", this.$route.params.tournamentID, "registrations", this.registrationDocId);
        await updateDoc(registrationDocRef, {
          teamName: this.teamName,
          teammateUsername: this.teammateUsername
        });
        alert("Registration updated successfully!");
        this.loadRegistrations();
      }
    },
    // Unregister user from the tournament
    async unregisterFromTournament() {
      if (this.registrationDocId) {
        const registrationDocRef = doc(db, "tournaments", this.$route.params.tournamentID, "registrations", this.registrationDocId);
        await deleteDoc(registrationDocRef);
        this.isRegistered = false;
        this.registrationDocId = null;
        alert("Unregistered successfully!");
        this.loadRegistrations(); // Refresh registrations after unregistering
      }
    },
    // Load all registered players for the tournament
    async loadRegistrations() {
      const registrationsRef = collection(db, "tournaments", this.$route.params.tournamentID, "registrations");
      const registrationsSnap = await getDocs(registrationsRef);
      this.registrations = registrationsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
   

    // Format Firestore timestamp for display
    formatTimestamp(timestamp) {
      const date = timestamp.toDate();
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  }
};
</script>

<style scoped>
.tournament-detail {
  color: white;
}
</style>
