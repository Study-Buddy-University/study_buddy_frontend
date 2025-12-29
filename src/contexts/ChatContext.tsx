import { createContext, useContext, useState, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { projectsService } from '@/services/projects'

interface Project {
  id: number
  name: string
  description?: string
  color: string
  agent_name?: string
  system_prompt?: string
  tools?: string[]
  created_at: string
  updated_at: string
}

interface ChatContextType {
  projectId: string | null
  selectedDocuments: number[]
  toggleDocument: (id: number) => void
  setSelectedDocuments: (docs: number[]) => void
  currentProject?: Project
  conversationId: number | null
  setConversationId: (id: number | null) => void
  systemPrompt: string
  setSystemPrompt: (prompt: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

interface ChatProviderProps {
  children: ReactNode
  projectId: string | null
}

export function ChatProvider({ children, projectId }: ChatProviderProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([])
  const [conversationId, setConversationId] = useState<number | null>(null)

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsService.getProjects()
      return Array.isArray(response) ? response : []
    },
  })

  const currentProject = projects.find(p => p.id === Number(projectId))
  
  // Derive systemPrompt from currentProject instead of storing in state
  const systemPrompt = currentProject?.system_prompt || ''
  
  // Use a callback to update system prompt in project
  const setSystemPrompt = (prompt: string) => {
    // This is handled by the parent component's mutation
    console.log('System prompt update:', prompt)
  }

  const toggleDocument = (id: number) => {
    setSelectedDocuments(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    )
  }

  return (
    <ChatContext.Provider
      value={{
        projectId,
        selectedDocuments,
        toggleDocument,
        setSelectedDocuments,
        currentProject,
        conversationId,
        setConversationId,
        systemPrompt,
        setSystemPrompt,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider')
  }
  return context
}
