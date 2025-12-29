// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================
// User & Auth Types
// ============================================

export interface User {
  id: number
  email: string
  name: string
  bio?: string
  organization?: string
  avatar_url?: string
  timezone: string
  language: string
  created_at: string
  updated_at: string
}

export interface UserProfileUpdate {
  name?: string
  email?: string
  bio?: string
  organization?: string
  timezone?: string
  language?: string
}

export interface PasswordChangeRequest {
  current_password: string
  new_password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  name: string
}

// ============================================
// Project Types
// ============================================

export interface Project {
  id: number
  name: string
  description?: string
  color: string
  agent_name?: string
  system_prompt?: string
  tools?: string[]
  user_id: number
  created_at: string
  updated_at: string
  // Stats (computed, not stored)
  conversation_count?: number
  message_count?: number
  document_count?: number
}

export interface CreateProjectRequest {
  name: string
  description?: string
  color?: string
  agent_name?: string
  system_prompt?: string
  tools?: string[]
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  color?: string
  agent_name?: string
  system_prompt?: string
  tools?: string[]
}

// ============================================
// Document Types
// ============================================

export interface Document {
  id: string
  name: string
  type: 'pdf' | 'doc' | 'docx' | 'txt' | 'md' | 'text'
  size: number
  sizeFormatted: string
  projectId?: string
  project?: Pick<Project, 'id' | 'name'>
  uploadDate: string
  messageCount: number
  url?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface UploadDocumentRequest {
  file: File
  projectId?: string
}

export interface UploadDocumentResponse {
  document: Document
  uploadUrl?: string
}

// ============================================
// Chat/Message Types
// ============================================

export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: {
    projectId?: string
    documentId?: string
    model?: string
    tokens?: number
  }
  createdAt: string
}

export interface Conversation {
  id: string
  title: string
  userId: string
  projectId?: string
  documentId?: string
  lastMessage?: Message
  messageCount: number
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateConversationRequest {
  title?: string
  projectId?: string
  documentId?: string
}

export interface SendMessageRequest {
  conversationId: string
  content: string
  use_gpu?: boolean
  context?: {
    projectId?: string
    documentId?: string
  }
}

export interface StreamMessageResponse {
  id: string
  content: string
  done: boolean
  metadata?: {
    model?: string
    tokens?: number
  }
}

// ============================================
// Dashboard/Stats Types
// ============================================

export interface DashboardStats {
  totalProjects: number
  totalDocuments: number
  totalConversations: number
  totalMessages: number
  projectsThisMonth: number
  documentsThisWeek: number
  learningStreak: number
}

export interface RecentActivity {
  id: string
  type: 'project' | 'document' | 'conversation'
  title: string
  timestamp: string
  projectId?: string
  documentId?: string
  conversationId?: string
}

// ============================================
// Error Types
// ============================================

export interface ApiErrorResponse {
  message: string
  code?: string
  errors?: Record<string, string[]>
  statusCode: number
}
