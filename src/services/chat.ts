import { api } from '@/lib/api'
import type {
  Conversation,
  Message,
  CreateConversationRequest,
  SendMessageRequest,
  PaginatedResponse,
} from '@/types/api'

export const chatService = {
  /**
   * Get all conversations for current user
   */
  async getConversations(params?: {
    page?: number
    pageSize?: number
    projectId?: string
    documentId?: string
  }): Promise<PaginatedResponse<Conversation>> {
    return api.get<PaginatedResponse<Conversation>>('/conversations', params)
  },

  /**
   * Get single conversation
   */
  async getConversation(id: string): Promise<Conversation> {
    return api.get<Conversation>(`/conversations/${id}`)
  },

  /**
   * Create new conversation
   */
  async createConversation(data: CreateConversationRequest): Promise<Conversation> {
    return api.post<Conversation>('/conversations', data)
  },

  /**
   * Update conversation (e.g., change title)
   */
  async updateConversation(id: number, data: { title?: string }): Promise<void> {
    return api.patch(`/conversations/${id}`, data)
  },

  /**
   * Delete conversation
   */
  async deleteConversation(id: number): Promise<void> {
    return api.delete(`/conversations/${id}`)
  },

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, params?: {
    page?: number
    pageSize?: number
  }): Promise<PaginatedResponse<Message>> {
    return api.get<PaginatedResponse<Message>>(`/conversations/${conversationId}/messages`, params)
  },

  /**
   * Send message (non-streaming)
   */
  async sendMessage(data: SendMessageRequest): Promise<Message> {
    return api.post<Message>('/messages', data)
  },

  /**
   * Send message with streaming response
   */
  async sendMessageStream(
    data: SendMessageRequest,
    onChunk: (chunk: string) => void,
    onComplete: (message: Message) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/messages/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      onError(new Error(error.message || 'Stream failed'))
      return
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      onError(new Error('No response body'))
      return
    }

    try {
      let buffer = ''
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            if (data === '[DONE]') {
              continue
            }

            try {
              const parsed = JSON.parse(data)
              
              if (parsed.content) {
                onChunk(parsed.content)
              }
              
              if (parsed.done && parsed.message) {
                onComplete(parsed.message)
              }
            } catch (e) {
              console.error('Failed to parse stream chunk:', e)
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error)
    }
  },

  /**
   * Pin/unpin conversation
   */
  async togglePin(id: string, isPinned: boolean): Promise<Conversation> {
    return api.patch<Conversation>(`/conversations/${id}`, { isPinned })
  },
}
