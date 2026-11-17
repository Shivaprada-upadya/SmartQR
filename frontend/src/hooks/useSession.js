import { useEffect, useState } from 'react'
import { getToken } from '../services/api'
import { getCurrentUser, logout } from '../services/auth.service'

export default function useSession() {
  const [user, setUser] = useState(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      if (!getToken()) {
        setIsCheckingSession(false)
        return
      }

      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch {
        logout()
      } finally {
        setIsCheckingSession(false)
      }
    }

    restoreSession()
  }, [])

  const clearSession = () => {
    logout()
    setUser(null)
  }

  return { user, setUser, isCheckingSession, clearSession }
}
