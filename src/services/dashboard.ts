import { api } from '@/lib/api'
import type { DashboardStats, RecentActivity } from '@/types/api'

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    return api.get<DashboardStats>('/dashboard/stats')
  },

  /**
   * Get recent activity
   */
  async getRecentActivity(limit = 10): Promise<RecentActivity[]> {
    return api.get<RecentActivity[]>('/dashboard/activity', { limit })
  },
}
