import { createContext, useState, ReactNode, useEffect } from 'react'
import { authService } from '@/services/auth'
import type { User, LoginRequest, SignupRequest } from '@/types/api'

interface AuthContextType {
  user: User | null
  avatarCacheKey: string
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  signup: (data: SignupRequest) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  invalidateAvatarCache: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [avatarCacheKey, setAvatarCacheKey] = useState(() => Date.now().toString())

  // Initialize auth state - simplified since loader handles redirects
  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
        } catch {
          // Token invalid, loader will redirect on next navigation
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    const response = await authService.login(credentials)
    setUser(response.user)
    setAvatarCacheKey(Date.now().toString())
  }

  const signup = async (data: SignupRequest) => {
    const response = await authService.signup(data)
    setUser(response.user)
    setAvatarCacheKey(Date.now().toString())
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    setAvatarCacheKey(Date.now().toString())
  }

  const refreshUser = async () => {
    const currentUser = await authService.getCurrentUser()
    setUser(currentUser)
    setAvatarCacheKey(Date.now().toString())
  }

  const invalidateAvatarCache = () => {
    setAvatarCacheKey(Date.now().toString())
  }

  const value: AuthContextType = {
    user,
    avatarCacheKey,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshUser,
    invalidateAvatarCache,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
