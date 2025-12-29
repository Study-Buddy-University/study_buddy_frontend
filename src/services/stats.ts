import { api } from '@/lib/api'

export interface ConversationStats {
  conversation_id: number
  message_count: number
  total_tokens: number
  max_tokens: number
  usage_percentage: number
  remaining_tokens: number
  is_near_limit: boolean
  document_count: number
}

export interface OverviewStats {
  totals: {
    projects: number
    conversations: number
    messages: number
    documents: number
  }
  recent_projects: Array<{
    id: number
    name: string
    color: string
    updated_at: string
  }>
  recent_conversations: Array<{
    id: number
    title: string
    project_id: number
    updated_at: string
  }>
}

export const statsService = {
  async getOverviewStats(): Promise<OverviewStats> {
    return api.get<OverviewStats>('/stats/overview')
  },

  async getConversationStats(conversationId: number): Promise<ConversationStats> {
    return api.get<ConversationStats>(`/stats/conversation/${conversationId}`)
  },
}
