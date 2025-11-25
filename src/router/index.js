import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Review from '../pages/Review.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/review/:id',
    name: 'Review',
    component: Review
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

