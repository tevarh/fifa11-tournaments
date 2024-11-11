// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router';
import HomeComponent from '../views/HomeComponent.vue';
import TournamentsComponent from '../views/TournamentsComponent.vue';
import UsersComponent from '../views/UsersComponent.vue';
import CreateTournamentComponent from '../views/CreateTournamentComponent.vue';
import { auth } from '../firebase';
import { onAuthStateChanged } from "firebase/auth";
import TournamentDetailComponent from '../views/TournamentDetailComponent.vue';

const ADMIN_EMAILS = process.env.VUE_APP_ADMIN_EMAILS.split(',');

const routes = [
  { path: '/', name: 'Home', component: HomeComponent },
  { path: '/tournaments', name: 'Tournaments', component: TournamentsComponent },
  { path: '/tournaments/create', name: 'CreateTournament', component: CreateTournamentComponent, meta: { requiresAdmin: true } },
  { path: '/tournaments/:tournamentID', name: 'TournamentDetail', component: TournamentDetailComponent },
  { path: '/users', name: 'Users', component: UsersComponent, meta: { requiresAdmin: true } },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin) {
    onAuthStateChanged(auth, (user) => {
      if (user && ADMIN_EMAILS.includes(user.email)) {
        next(); // Allow access for admins
      } else {
        next('/'); // Redirect non-admins to the home page
      }
    });
  } else {
    next(); // Proceed if no admin access is required
  }
});

export default router;
