<template>
  <div class="tournaments-content">
    <h1 class="mb-4">Tournaments Page</h1>
    <p>{{ $t("tournamentInfo") }}</p>
    <p>{{ $t("tournamentDevelopmentInfo") }}</p>
    <table class="table table-hover table-dark table-striped">
      <thead>
        <tr>
          <th scope="col">Tournament Name</th>
          <th scope="col">Type</th>
          <th scope="col">Status</th>
          <th scope="col">Format</th>
          <th scope="col">Players</th>
          <th scope="col">Action</th>
          <th v-if="isAdmin" scope="col">Admin Options</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tournament in tournaments" :key="tournament.id">
          <td>
            <router-link :to="{ name: 'TournamentDetail', params: { tournamentID: tournament.id } }" class="text-white">{{ tournament.name }}</router-link>
          </td>
          <td>{{ tournament.type }}</td>
          <td>{{ tournament.status || "Upcoming" }}</td>
          <td>{{ tournament.teamSize === 1 ? "1v1" : "2v2" }}</td>
          <td>{{ getPlayerCount(tournament.id) }}/{{ tournament.maxPlayers }}</td>
          <td>
            <router-link
              v-if="user && !isRegistered(tournament.id) && getPlayerCount(tournament.id) < tournament.maxPlayers"
              :to="{ name: 'TournamentDetail', params: { tournamentID: tournament.id } }"
              class="btn btn-outline-light btn-sm font-weight-bold"
            >
              Register
            </router-link>
            <button
              v-else-if="isRegistered(tournament.id)"
              @click="unregisterFromTournament(tournament.id)"
              class="btn btn-outline-light btn-sm font-weight-bold"
            >
              Unregister
            </button>
            <span v-else-if="getPlayerCount(tournament.id) >= tournament.maxPlayers" class="text-danger">Tournament Full</span>
            <span v-else class="text-muted">Log in to register</span>
          </td>
          <td v-if="isAdmin">
            <button @click="changeStatus(tournament)" class="btn btn-sm btn-info me-1">Change Status</button>
            <button @click="deleteTournament(tournament.id)" class="btn btn-sm btn-danger">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc, query, where, writeBatch, updateDoc, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

export default {
  props: {
    isAdmin: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      tournaments: [],
      user: null,
      registeredTournaments: [], // Holds IDs of tournaments the user is registered for
      playerCounts: {} // Holds the player count for each tournament
    };
  },
  async mounted() {
    await this.loadTournaments();
    onAuthStateChanged(auth, async (user) => {
      this.user = user;
      if (user) {
        await this.checkUserRegistrations();
      }
    });
  },
  methods: {
    async loadTournaments() {
      const snapshot = await getDocs(collection(db, "tournaments"));
      this.tournaments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.calculatePlayerCounts();
    },
    async calculatePlayerCounts() {
      for (const tournament of this.tournaments) {
        const registrationRef = collection(db, "tournaments", tournament.id, "registrations");
        const snapshot = await getDocs(registrationRef);
        this.playerCounts[tournament.id] = snapshot.size; // Store count for each tournament
      }
    },
    getPlayerCount(tournamentId) {
      return this.playerCounts[tournamentId] || 0;
    },
    async checkUserRegistrations() {
      if (!this.user) return;

      const registrations = [];
      for (const tournament of this.tournaments) {
        const registrationRef = collection(db, "tournaments", tournament.id, "registrations");
        const q = query(registrationRef, where("userId", "==", this.user.uid));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          registrations.push(tournament.id);
        }
      }

      this.registeredTournaments = registrations;
    },
    isRegistered(tournamentId) {
      return this.registeredTournaments.includes(tournamentId);
    },
    async registerForTournament(tournamentId) {
      const registrationRef = collection(db, "tournaments", tournamentId, "registrations");
      await addDoc(registrationRef, {
        userId: this.user.uid,
        playerName: this.user.displayName,
        registeredAt: new Date(),
        tournamentId
      });
      this.registeredTournaments.push(tournamentId);
    },
    async unregisterFromTournament(tournamentId) {
      try {
        const registrationRef = collection(db, "tournaments", tournamentId, "registrations");
        const q = query(registrationRef, where("userId", "==", this.user.uid));
        const snapshot = await getDocs(q);

        const batch = writeBatch(db);
        snapshot.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();

        this.registeredTournaments = this.registeredTournaments.filter(id => id !== tournamentId);
        alert("Unregistered successfully!");
      } catch (error) {
        console.error("Error unregistering from tournament:", error);
        alert("Failed to unregister from the tournament.");
      }
    },
    async deleteTournament(tournamentId) {
      if (confirm("Are you sure you want to delete this tournament?")) {
        await deleteDoc(doc(db, "tournaments", tournamentId));
        alert("Tournament deleted successfully.");
        this.loadTournaments();
      }
    },
    async changeStatus(tournament) {
      const newStatus = prompt("Enter new status for the tournament:", tournament.status);
      if (newStatus) {
        await updateDoc(doc(db, "tournaments", tournament.id), {
          status: newStatus
        });
        alert("Tournament status updated.");
        this.loadTournaments();
      }
    }
  }
};
</script>
