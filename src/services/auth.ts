import { api } from '@/lib/api'
import type { AuthResponse, LoginRequest, SignupRequest, User } from '@/types/api'

export const authService = {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials)
    
    // Store token in localStorage
    if (response.access_token) {
      localStorage.setItem('auth_token', response.access_token)
    }
    
    return response
  },

  /**
   * Register new user
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/signup', data)
    
    // Store token in localStorage
    if (response.access_token) {
      localStorage.setItem('auth_token', response.access_token)
    }
    
    return response
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } finally {
      // Clear token regardless of API response
      localStorage.removeItem('auth_token')
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    return api.get<User>('/auth/me')
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh')
    
    if (response.access_token) {
      localStorage.setItem('auth_token', response.access_token)
    }
    
    return response
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token')
  },

  /**
   * Get auth token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token')
  },
}
