import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../api/api'

const initializeAuthState = () => {
  try {
    const storedUser = localStorage.getItem('currentUser')
    const storedSession = localStorage.getItem('currentSession')
    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      session: storedSession ? JSON.parse(storedSession) : null
    }
  } catch (error) {
    console.error('[useAuth] Error loading from localStorage:', error)
    return { user: null, session: null }
  }
}

const { user, session: sessionData } = initializeAuthState();
const currentUser = ref(user)
const currentSession = ref(sessionData)

/**
 * Safely get userId from localStorage
 * @returns {string|null} The userId or null if not found/invalid
 */
export function getUserId() {
  try {
    const stored = localStorage.getItem('currentUser');
    if (!stored || stored === 'undefined') return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('[getUserId] Error parsing currentUser:', error);
    return null;
  }
}

/**
 * Safely get session from localStorage
 * @returns {string|null} The session ID or null if not found/invalid
 */
export function getSession() {
  try {
    const stored = localStorage.getItem('currentSession');
    if (!stored || stored === 'undefined') return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('[getSession] Error parsing currentSession:', error);
    return null;
  }
}

export function useAuth() {
  const router = useRouter()

  const login = async (username, password) => {
    try {
        if ((await auth.getUserByUsername(username)).length === 0) {
            throw new Error('Account with username does not exist.')
        }

        const response = await auth.login(username, password)
        
        if (response.error) {
            throw new Error('Password is incorrect.')
        }

        currentSession.value = response.session
        const sessionUserResponse = await auth.getSessionUser(response.session)
        if (sessionUserResponse.error) {
            throw new Error('Session user not found.')
        }
        currentUser.value = sessionUserResponse[0].user
        
        // Persist to localStorage
        localStorage.setItem('currentUser', JSON.stringify(sessionUserResponse[0].user))
        localStorage.setItem('currentSession', JSON.stringify(response.session))
        
        return { success: true }
    } catch (error) {
        console.error('[useAuth] Login error:', error)
        return { success: false, error: error.message || 'Login failed' }
    }
  }

  const signup = async (username, password) => {
    try {
        if ((await auth.getUserByUsername(username)).length !== 0) {
            throw new Error('Account with username already exists.')
        }

        const registerData = await auth.register(username, password)
        
        if (registerData.error) {
            throw new Error('Registration failed')
        }
        
        await login(username, password)

        return { success: true }
    } catch (error) {
        console.error('[useAuth] Signup error:', error)
        return { success: false, error: error.message || 'Signup failed' }
    }
  }

  const logout = async () => {
    try {
        if (currentSession.value) {
            await auth.logout(currentSession.value)
        }

        currentUser.value = null
        currentSession.value = null
        
        localStorage.removeItem('currentUser')
        localStorage.removeItem('currentSession')
        
        router.push('/login')
    } catch (error) {
        console.error('Logout error:', error)
    }
  }

  const checkSession = async () => {
    if (!currentSession.value) {
        return false
    }

    try {
        const data = await auth.getSessionUser(currentSession.value)
      
        if (!data[0] || !data[0].user) {
            currentUser.value = null
            currentSession.value = null
            localStorage.removeItem('currentUser')
            localStorage.removeItem('currentSession')
            return false
        }

        currentUser.value = data[0].user
        localStorage.setItem('currentUser', JSON.stringify(data[0].user))
        return true
    } catch (error) {
        currentUser.value = null
        currentSession.value = null
        localStorage.removeItem('currentUser')
        localStorage.removeItem('currentSession')
        return false
    }
  }

  return {
    currentUser,
    currentSession,
    login,
    signup,
    logout,
    checkSession,
    isAuthenticated: () => !!currentSession.value
  }
}
