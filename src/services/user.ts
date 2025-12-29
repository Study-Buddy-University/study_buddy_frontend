import { api } from '@/lib/api'
import { User, UserProfileUpdate, PasswordChangeRequest } from '@/types/api'

export const userService = {
  async getCurrentUser(): Promise<User> {
    return api.get<User>('/users/me')
  },

  async updateProfile(data: UserProfileUpdate): Promise<User> {
    return api.put<User>('/users/me', data)
  },

  async changePassword(data: PasswordChangeRequest): Promise<{ message: string }> {
    return api.put<{ message: string }>('/users/me/password', data)
  },

  async deleteAccount(): Promise<{ message: string }> {
    return api.delete<{ message: string }>('/users/me')
  },

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData()
    formData.append('file', file)
    
    // Upload with multipart/form-data
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1'}/users/me/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: formData,
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to upload avatar')
    }
    
    return response.json()
  },
}
