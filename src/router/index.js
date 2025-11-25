import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Review from '../pages/Review.vue'
import Login from '../pages/Login.vue'
import Signup from '../pages/Signup.vue'
import { useAuth } from '../composables/useAuth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/review/:id',
    name: 'Review',
    component: Review,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const { isAuthenticated, checkSession } = useAuth()
  
  await checkSession()
  
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else if (to.meta.requiresGuest && isAuthenticated()) {
    next('/')
  } else {
    next()
  }
})

export default router

