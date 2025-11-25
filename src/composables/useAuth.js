import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth, session } from '../api/api'

const currentUser = ref(null)
const currentSession = ref(null)

export function useAuth() {
  const router = useRouter()

  const login = async (username, password) => {
    try {
      const authData = await auth.authenticate(username, password)
      const sessionData = await session.create(authData.user)

      currentUser.value = authData.user
      currentSession.value = sessionData.session
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const signup = async (username, password) => {
    try {
      const registerData = await auth.register(username, password)
      const sessionData = await session.create(registerData.user)

      currentUser.value = registerData.user
      currentSession.value = sessionData.session
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      if (currentSession.value) {
        await session.delete(currentSession.value)
      }

      currentUser.value = null
      currentSession.value = null
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
        return false
      }

      currentUser.value = data[0].user
      return true
    } catch (error) {
      currentUser.value = null
      currentSession.value = null
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
