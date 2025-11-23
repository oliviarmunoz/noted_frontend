import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Playlists from '../pages/Playlists.vue'
import Profile from '../pages/Profile.vue'
import SongDetail from '../pages/SongDetail.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/playlists',
    name: 'Playlists',
    component: Playlists
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/song/:id',
    name: 'SongDetail',
    component: SongDetail
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

