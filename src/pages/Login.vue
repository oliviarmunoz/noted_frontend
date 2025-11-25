<template>
  <div class="auth-page">
    <div class="auth-left">
      <div class="brand-section">
        <h1 class="logo">NOTED</h1>
        <p class="tagline">Your music, your notes, your community</p>
      </div>
    </div>
    
    <div class="auth-right">
      <div class="auth-card">
        <h2 class="auth-title">Login</h2>
        
        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input 
              id="username" 
              v-model="username" 
              type="text" 
              required 
              class="form-input"
              placeholder="Enter your username"
            />
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <div class="password-input-wrapper">
              <input 
                id="password" 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                required 
                class="form-input"
                placeholder="Enter your password"
              />
              <button 
                type="button" 
                class="password-toggle" 
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
              >
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
          </div>
          
          <p v-if="error" class="error-message">{{ error }}</p>
          
          <button type="submit" class="submit-btn">Login</button>
        </form>
        
        <p class="auth-footer">
          Don't have an account? 
          <router-link to="/signup" class="auth-link">Sign up</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { login } = useAuth()

const username = ref('')
const password = ref('')
const error = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  error.value = ''
  const result = await login(username.value, password.value)
  
  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  background: #0a0e1a;
}

.auth-left {
  flex: 1.5;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0e1a 0%, #1a2334 100%);
  padding: 4rem;
}

.brand-section {
  max-width: 600px;
  text-align: center;
}

.logo {
  font-size: 8rem;
  font-weight: 900;
  letter-spacing: 0.05em;
  background: linear-gradient(135deg, #4a9eff 0%, #7b68ee 50%, #ff6b9d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 1rem 0;
  line-height: 1;
}

.tagline {
  color: #7b8ca8;
  font-size: 1.25rem;
  margin: 0;
  line-height: 1.6;
}

.auth-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background: rgba(26, 35, 52, 0.3);
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: rgba(26, 35, 52, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 12px;
  padding: 2.5rem;
  backdrop-filter: blur(10px);
}

.auth-title {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 2rem 0;
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #7b8ca8;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.password-input-wrapper {
  position: relative;
  width: 100%;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(10, 14, 26, 0.6);
  border: 1px solid rgba(123, 140, 168, 0.2);
  border-radius: 8px;
  color: #ffffff;
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.password-input-wrapper .form-input {
  padding-right: 3rem;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #7b8ca8;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.password-toggle:hover {
  color: #4a9eff;
}

.form-input:focus {
  outline: none;
  border-color: #4a9eff;
  box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.1);
}

.form-input::placeholder {
  color: #4a5568;
}

.error-message {
  color: #ff6b9d;
  font-size: 0.875rem;
  margin: -0.5rem 0 0 0;
  padding: 0.75rem;
  background: rgba(255, 107, 157, 0.1);
  border: 1px solid rgba(255, 107, 157, 0.2);
  border-radius: 6px;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #4a9eff 0%, #7b68ee 100%);
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(74, 158, 255, 0.3);
}

.submit-btn:active {
  transform: translateY(0);
}

.auth-footer {
  margin: 1.5rem 0 0 0;
  text-align: center;
  color: #7b8ca8;
  font-size: 0.9rem;
}

.auth-link {
  color: #4a9eff;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.auth-link:hover {
  color: #7b68ee;
  text-decoration: underline;
}

@media (max-width: 968px) {
  .auth-page {
    flex-direction: column;
  }

  .auth-left {
    padding: 3rem 2rem;
  }

  .logo {
    font-size: 4rem;
  }

  .tagline {
    font-size: 1rem;
  }

  .auth-right {
    padding: 2rem;
  }
}
</style>
