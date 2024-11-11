<template>
    <div>
      <h1>Create Tournament</h1>
      <form @submit.prevent="createTournament">
        <label>
          Tournament Name:
          <input v-model="tournamentName" required />
        </label>
        <br>
        <br>
        <label>
          Team Size:
          <select v-model="teamSize" required>
            <option :value="1">1v1</option>
            <option :value="2">2v2</option>
          </select>
        </label>
        <br>
        <br>
        <label>
            Maximum Players:
            <input type="number" v-model="maxPlayers" min="1" required />
        </label>
        <br><br>
        <button type="submit">Create</button>
      </form>
    </div>
  </template>
  
  <script>
  import { db } from '../firebase';
  import { collection, addDoc, serverTimestamp } from "firebase/firestore";
  
  export default {
    data() {
      return {
        tournamentName: "",
        teamSize: 1,
        maxPlayers: 10
      };
    },
    methods: {
      async createTournament() {
        try {
          await addDoc(collection(db, "tournaments"), {
            name: this.tournamentName,
            type: "League",
            teamSize: this.teamSize,
            maxPlayers: this.maxPlayers,
            createdAt: serverTimestamp(),
          });
          alert("Tournament created successfully!");
          this.tournamentName = "";
          this.teamSize = 1;
          this.maxPlayers = 10;
        } catch (error) {
          console.error("Error creating tournament:", error);
          alert("Failed to create tournament.");
        }
      },
    },
  };
  </script>
  