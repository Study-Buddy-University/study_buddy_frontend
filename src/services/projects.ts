import { api } from '@/lib/api'
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  PaginatedResponse,
} from '@/types/api'

export const projectsService = {
  /**
   * Get all projects for current user
   */
  async getProjects(params?: {
    page?: number
    pageSize?: number
    search?: string
    status?: 'active' | 'archived'
  }): Promise<PaginatedResponse<Project>> {
    return api.get<PaginatedResponse<Project>>('/projects', params)
  },

  /**
   * Get single project by ID
   */
  async getProject(id: string): Promise<Project> {
    return api.get<Project>(`/projects/${id}`)
  },

  /**
   * Create new project
   */
  async createProject(data: CreateProjectRequest): Promise<Project> {
    return api.post<Project>('/projects', data)
  },

  /**
   * Update existing project
   */
  async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    return api.put<Project>(`/projects/${id}`, data)
  },

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<void> {
    return api.delete(`/projects/${id}`)
  },

  /**
   * Archive project
   */
  async archiveProject(id: string): Promise<Project> {
    return api.patch<Project>(`/projects/${id}`, {
      status: 'archived',
    })
  },

  /**
   * Unarchive project
   */
  async unarchiveProject(id: string): Promise<Project> {
    return api.patch<Project>(`/projects/${id}`, {
      status: 'active',
    })
  },
}
