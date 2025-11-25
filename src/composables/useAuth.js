import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth, session, playlist } from '../api/api'

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

const { user, session: sessionData } = initializeAuthState()
const currentUser = ref(user)
const currentSession = ref(sessionData)

export function useAuth() {
  const router = useRouter()

  const login = async (username, password) => {
    try {
        if ((await auth.getUserByUsername(username)).length === 0) {
            throw new Error('Account with username does not exist.')
        }

        const authData = await auth.authenticate(username, password)
        
        if (authData.error) {
            throw new Error('Password is incorrect.')
        }
        
        const sessionData = await session.create(authData.user)

        currentUser.value = authData.user
        currentSession.value = sessionData.session
        
        // Persist to localStorage
        localStorage.setItem('currentUser', JSON.stringify(authData.user))
        localStorage.setItem('currentSession', JSON.stringify(sessionData.session))
        
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
        
        const sessionData = await session.create(registerData.user)

        currentUser.value = registerData.user
        currentSession.value = sessionData.session
        
        localStorage.setItem('currentUser', JSON.stringify(registerData.user))
        localStorage.setItem('currentSession', JSON.stringify(sessionData.session))

        await playlist.createPlaylist(registerData.user, 'Listen Later')
        await playlist.createPlaylist(registerData.user, 'Favorites')
        
        return { success: true }
    } catch (error) {
        console.error('[useAuth] Signup error:', error)
        return { success: false, error: error.message || 'Signup failed' }
    }
  }

  const logout = async () => {
    try {
        if (currentSession.value) {
            await session.delete(currentSession.value)
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
        const data = await session.getUser(currentSession.value)
      
        if (!data[0]) {
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
