import { api } from '@/lib/api'

export interface GPUInfo {
  name: string
  memory_total_mb: number
  memory_used_mb: number
  memory_free_mb: number
  utilization_percent: number
}

export interface SystemGPUResponse {
  available: boolean
  gpu_count: number
  gpus: GPUInfo[]
  driver_version?: string
  message?: string
}

export const systemService = {
  /**
   * Get GPU information
   */
  async getGPUInfo(): Promise<SystemGPUResponse> {
    return api.get<SystemGPUResponse>('/system/gpu')
  },
}
