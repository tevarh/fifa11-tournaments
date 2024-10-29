// src/router/index.js
import { createRouter, createWebHashHistory  } from 'vue-router';
import HomeComponent from '../views/HomeComponent.vue';
import TournamentsComponent from '../views/TournamentsComponent.vue';
import UsersComponent from '../views/UsersComponent.vue';

const routes = [
  { path: '/', name: 'Home', component: HomeComponent },
  { path: '/tournaments', name: 'Tournaments', component: TournamentsComponent },
  { path: '/users', name: 'Users', component: UsersComponent },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
