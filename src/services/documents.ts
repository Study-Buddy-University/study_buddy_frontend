import { api } from '@/lib/api'
import type {
  Document,
  PaginatedResponse,
} from '@/types/api'

export const documentsService = {
  /**
   * Get all documents for current user
   */
  async getDocuments(params?: {
    page?: number
    pageSize?: number
    search?: string
    projectId?: string
    type?: string
  }): Promise<PaginatedResponse<Document>> {
    return api.get<PaginatedResponse<Document>>('/documents', params)
  },

  /**
   * Get single document by ID
   */
  async getDocument(id: string): Promise<Document> {
    const response = await api.get<any>(`/documents/${id}`)
    return {
      id: response.id.toString(),
      name: response.filename,
      type: response.file_type.includes('pdf') ? 'pdf' : 
            response.file_type.includes('doc') ? 'doc' :
            response.filename.endsWith('.md') ? 'md' : 'txt',
      size: response.file_size,
      sizeFormatted: this.formatFileSize(response.file_size),
      projectId: response.project_id?.toString(),
      uploadDate: response.created_at,
      messageCount: 0,
      userId: '1',
      createdAt: response.created_at,
      updatedAt: response.created_at,
    }
  },

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  },

  /**
   * Upload document
   */
  async uploadDocument(projectId: number, file: File): Promise<Document> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('project_id', projectId.toString())

    const token = localStorage.getItem('auth_token')
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1'
    const response = await fetch(`${baseUrl}/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Upload failed')
    }

    return response.json()
  },

  /**
   * Delete document
   */
  async deleteDocument(id: string): Promise<void> {
    return api.delete(`/documents/${id}`)
  },

  /**
   * Download document
   */
  async downloadDocument(id: string): Promise<Blob> {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/documents/${id}/download`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Download failed')
    }

    return response.blob()
  },

  /**
   * Get documents by project
   */
  async getDocumentsByProject(projectId: number): Promise<Document[]> {
    return api.get<Document[]>(`/documents/project/${projectId}`)
  },

  /**
   * Delete document by ID
   */
  async deleteDocumentById(id: number): Promise<void> {
    return api.delete(`/documents/${id}`)
  },
}
