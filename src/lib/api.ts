import axios, { AxiosError, AxiosInstance } from 'axios'
import { config } from './config'

export class ApiError extends Error {
  status: number
  data?: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ message?: string }>) => {
    const message =
      error.response?.data?.message || error.message || 'Request failed'
    const status = error.response?.status || 500
    const data = error.response?.data as unknown

    throw new ApiError(message, status, data)
  }
)

export const api = {
  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    return axiosInstance.get(endpoint, { params })
  },

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return axiosInstance.post(endpoint, data)
  },

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return axiosInstance.put(endpoint, data)
  },

  async delete<T>(endpoint: string): Promise<T> {
    return axiosInstance.delete(endpoint)
  },

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return axiosInstance.patch(endpoint, data)
  },
}
