<template>
  <div>
    <h1>Sign Up</h1>
    <form @submit.prevent="handleSignup">
      <div>
        <label for="username">Username:</label>
        <input 
          id="username" 
          v-model="username" 
          type="text" 
          required 
        />
      </div>
      <div>
        <label for="password">Password:</label>
        <input 
          id="password" 
          v-model="password" 
          type="password" 
          required 
        />
      </div>
      <button type="submit">Sign Up</button>
    </form>
    <p v-if="error">{{ error }}</p>
    <p>
      Already have an account? 
      <router-link to="/login">Login</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { signup } = useAuth()

const username = ref('')
const password = ref('')
const error = ref('')

const handleSignup = async () => {
  error.value = ''
  const result = await signup(username.value, password.value)
  
  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error
  }
}
</script>
