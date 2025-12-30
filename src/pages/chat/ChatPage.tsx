import { useEffect, useState, useRef, useMemo } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Send, Mic, FolderKanban, X, Plus, Loader2, Settings } from 'lucide-react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { projectsService } from '@/services/projects'
import { api } from '@/lib/api'
import { ConversationSidebar } from '@/components/chat/ConversationSidebar'
import { DocumentPanel } from '@/components/chat/DocumentPanel'
import { DocumentViewer } from '@/components/chat/DocumentViewer'
import { ChatStats } from '@/components/chat/ChatStats'
import { CodeBlock } from '@/components/chat/CodeBlock'
import { ChatProvider, useChatContext } from '@/contexts/ChatContext'
import { useAuth } from '@/hooks/useAuth'
import { getAvatarUrl } from '@/lib/config'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'tool'
  content: string
  created_at: string
  tool_name?: string
  tool_status?: 'executing' | 'success' | 'error'
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

interface ToolStatus {
  tool: string
  status: 'executing' | 'success' | 'error'
  message?: string
}

function ChatPageContent() {
  const { user, avatarCacheKey } = useAuth()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [toolStatus, setToolStatus] = useState<ToolStatus | null>(null)
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [viewingDocumentId, setViewingDocumentId] = useState<number | null>(null)
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false)
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)
  const [selectedModel, setSelectedModel] = useState('llama3-groq-tool-use:8b')
  const [useGpu, setUseGpu] = useState(() => {
    // Migration: remove old gpu_enabled key
    if (localStorage.getItem('gpu_enabled') !== null) {
      localStorage.removeItem('gpu_enabled')
    }
    
    const saved = localStorage.getItem('use_gpu')
    // Force GPU as default - override any old false values
    if (saved === null || saved === 'false') {
      localStorage.setItem('use_gpu', 'true')
      return true
    }
    return saved === 'true'
  })
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // GPU toggle handler (2025 best practice: side effects in handlers, not useEffect)
  const handleGpuToggle = () => {
    const newValue = !useGpu
    setUseGpu(newValue)
    localStorage.setItem('use_gpu', newValue.toString())
  }
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  
  const projectId = searchParams.get('project')
  const urlConversationId = searchParams.get('conversation')
  const urlDocumentId = searchParams.get('document')
  
  // Get selectedDocuments from ChatContext (managed by DocumentPanel)
  const { selectedDocuments, toggleDocument } = useChatContext()
  
  // Sync to localStorage when project changes (2025 pattern: direct sync, not useEffect)
  if (projectId) {
    localStorage.setItem('last_project_id', projectId)
  }

  // Auto-load document from URL parameter
  // Note: selectedDocuments and toggleDocument are intentionally omitted from deps
  // as they are stable context values that don't need to trigger re-runs
  useEffect(() => {
    if (urlDocumentId && projectId) {
      const docId = Number(urlDocumentId)
      
      // Set viewing document
      setViewingDocumentId(docId)
      
      // Auto-select document in context (if not already selected)
      if (!selectedDocuments.includes(docId)) {
        toggleDocument(docId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlDocumentId, projectId])

  // Fetch all projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsService.getProjects()
      return Array.isArray(response) ? response : []
    },
  })

  // Fetch available Ollama models
  const { data: modelsData } = useQuery({
    queryKey: ['ollama-models'],
    queryFn: async () => {
      const response = await api.get('/system/models') as {
        success: boolean
        models: { name: string; size: number; size_gb: number }[]
        count: number
      }
      return response
    },
    retry: 1,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Derive available models from query data (React 2025 best practice: useMemo for derived state)
  const availableModels = useMemo(() => {
    if (modelsData?.success && modelsData?.models) {
      return modelsData.models.map((m) => m.name)
    }
    return []
  }, [modelsData])

  // Get current project
  const currentProject = projects.find(p => p.id === Number(projectId))

  // Update mutation for project settings
  const updateProjectMutation = useMutation({
    mutationFn: (data: { system_prompt?: string }) =>
      projectsService.updateProject(String(projectId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project settings updated')
      setIsSettingsOpen(false)
    },
    onError: () => {
      toast.error('Failed to update settings')
    },
  })

  // Open settings dialog
  const openSettings = () => {
    setSystemPrompt(currentProject?.system_prompt || '')
    setIsSettingsOpen(true)
  }

  // Save settings
  const handleSaveSettings = () => {
    updateProjectMutation.mutate({ system_prompt: systemPrompt })
  }

  // Fetch conversation messages using React Query
  const { data: conversationMessages } = useQuery({
    queryKey: ['conversation-messages', urlConversationId],
    queryFn: async () => {
      if (!urlConversationId || !projectId) return null
      const response = await api.get<Message[]>(`/conversations/${Number(urlConversationId)}/messages`)
      return Array.isArray(response) ? response : []
    },
    enabled: !!urlConversationId && !!projectId,
    retry: 1,
  })

  // Set messages based on conversation state
  useEffect(() => {
    if (!projectId) {
      setMessages([])
      setConversationId(null)
      return
    }

    // No conversation in URL - new chat with welcome message
    if (!urlConversationId) {
      setConversationId(null)
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I'm ready to help you with **${currentProject?.name || 'your project'}**. Ask me anything!`,
        created_at: new Date().toISOString(),
      }])
      return
    }

    // Existing conversation - use React Query data
    const convId = Number(urlConversationId)
    setConversationId(convId)

    if (conversationMessages && conversationMessages.length > 0) {
      setMessages(conversationMessages)
    } else if (conversationMessages !== undefined) {
      // Empty conversation, show welcome
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I'm ready to help you with **${currentProject?.name || 'your project'}**. Ask me anything!`,
        created_at: new Date().toISOString(),
      }])
    }
  }, [urlConversationId, projectId, currentProject?.name, conversationMessages])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, streamingContent])

  const handleSendMessage = async () => {
    if (!input.trim() || !projectId || isStreaming) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsStreaming(true)
    setStreamingContent('')

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1'
      const response = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          project_id: Number(projectId),
          conversation_id: conversationId,
          model: selectedModel,
          use_gpu: useGpu,
          document_ids: selectedDocuments.length > 0 ? selectedDocuments : undefined,
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue
              
              try {
                const parsed = JSON.parse(data)
                
                // Handle tool execution status - add as persistent message
                if (parsed.type === 'tool_execution') {
                  const toolMessage: Message = {
                    id: `tool-${parsed.tool}-${Date.now()}`,
                    role: 'tool',
                    content: `Using ${parsed.tool}...`,
                    created_at: new Date().toISOString(),
                    tool_name: parsed.tool,
                    tool_status: 'executing'
                  }
                  setMessages(prev => [...prev, toolMessage])
                  // Don't set transient toolStatus - badge is already in messages
                }
                
                // Handle tool results - update the tool message
                if (parsed.type === 'tool_result') {
                  setMessages(prev => prev.map(msg => 
                    msg.role === 'tool' && msg.tool_name === parsed.tool && msg.tool_status === 'executing'
                      ? { 
                          ...msg, 
                          content: parsed.status === 'success' 
                            ? `✓ ${parsed.tool} completed` 
                            : `✗ ${parsed.tool} failed`,
                          tool_status: parsed.status 
                        }
                      : msg
                  ))
                  // No transient status to clear
                }
                
                // Backend sends 'chunk' not 'content'
                if (parsed.chunk) {
                  fullContent += parsed.chunk
                  setStreamingContent(fullContent)
                }
                // When done, save conversation_id and update URL
                if (parsed.done && parsed.conversation_id) {
                  const newConvId = parsed.conversation_id
                  setConversationId(newConvId)
                  // Update URL to include conversation ID so refresh stays in same session
                  navigate(`/chat?project=${projectId}&conversation=${newConvId}`, { replace: true })
                  setToolStatus(null) // Clear any lingering status
                }
              } catch (e) {
                console.error('Parse error:', e)
              }
            }
          }
        }
      }

      // Add complete AI message
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: fullContent || 'Sorry, I couldn\'t generate a response.',
        created_at: new Date().toISOString(),
      }

      setMessages(prev => [...prev, aiMessage])
      setStreamingContent('')
      setToolStatus(null) // Clear tool status
      
      // Refresh sidebar to show new/updated conversation and documents
      queryClient.invalidateQueries({ queryKey: ['conversations', projectId] })
      // Invalidate with string projectId to match DocumentPanel query key
      queryClient.invalidateQueries({ queryKey: ['project-documents', projectId] })
      queryClient.invalidateQueries({ queryKey: ['project-documents', Number(projectId)] })
    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Failed to send message')
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsStreaming(false)
      setStreamingContent('')
      setToolStatus(null) // Clear tool status on error
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearContext = () => {
    setSearchParams({})
    setMessages([])
  }

  // Show project selector if no project loaded
  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="max-w-2xl w-full text-center space-y-6">
          <div className="space-y-2">
            <FolderKanban className="h-16 w-16 mx-auto text-muted-foreground/50" />
            <h2 className="text-2xl font-bold">Select a Project to Start Chatting</h2>
            <p className="text-muted-foreground">
              Choose a project to provide context for your AI study session
            </p>
          </div>

          {projects.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium">Your Projects:</p>
              <div className="grid gap-2 max-w-md mx-auto">
                {projects.slice(0, 5).map((project) => (
                  <Link key={project.id} to={`/chat?project=${project.id}`}>
                    <Card className="hover:shadow-md transition-all cursor-pointer border-2 hover:border-primary">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <FolderKanban className="h-5 w-5 text-primary" />
                          <div className="text-left flex-1">
                            <p className="font-medium">{project.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {project.description || 'No description'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              {projects.length > 5 && (
                <Link to="/projects">
                  <Button variant="outline" size="sm">View All Projects</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You don't have any projects yet. Create one to get started!
              </p>
              <Link to="/projects">
                <Button size="lg" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Project
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Main chat interface
  return (
    <div className="h-full flex">
      {/* Left Sidebar - Conversations */}
      <ConversationSidebar 
        isCollapsed={isLeftPanelCollapsed}
        onToggleCollapse={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
      />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
      {/* Context Banner */}
      {currentProject && (
        <div className="border-b bg-muted/30 px-4 py-2.5">
          <div className="max-w-full mx-auto flex items-center gap-6">
            <div className="flex items-center gap-2.5 min-w-[200px]">
              <FolderKanban className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{currentProject.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  AI-powered study assistant
                </p>
              </div>
              <Badge variant="secondary" className="ml-1 text-[11px] h-5 shrink-0">Active</Badge>
            </div>
            
            {/* Token Stats */}
            <div className="flex-1 flex justify-center">
              <ChatStats 
                conversationId={conversationId} 
                documentCount={selectedDocuments.length}
              />
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-[200px] h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.length > 0 ? (
                    <>
                      {availableModels.filter(m => m.includes('0.5b') || m.includes('2b') || m.includes('mini')).length > 0 && (
                        <SelectGroup>
                          <SelectLabel>⚡ Fast Models (CPU-friendly)</SelectLabel>
                          {availableModels
                            .filter(m => m.includes('0.5b') || m.includes('2b') || m.includes('mini'))
                            .map(model => (
                              <SelectItem key={model} value={model}>{model}</SelectItem>
                            ))}
                        </SelectGroup>
                      )}
                      {availableModels.filter(m => !m.includes('0.5b') && !m.includes('2b') && !m.includes('mini')).length > 0 && (
                        <SelectGroup>
                          <SelectLabel>🚀 Full Models (Better Quality)</SelectLabel>
                          {availableModels
                            .filter(m => !m.includes('0.5b') && !m.includes('2b') && !m.includes('mini'))
                            .map(model => (
                              <SelectItem key={model} value={model}>{model}</SelectItem>
                            ))}
                        </SelectGroup>
                      )}
                    </>
                  ) : (
                    <SelectGroup>
                      <SelectLabel>Loading models...</SelectLabel>
                      <SelectItem value="llama3-groq-tool-use:8b">Loading...</SelectItem>
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
              <Button 
                variant={useGpu ? "default" : "outline"} 
                size="sm" 
                onClick={handleGpuToggle} 
                className="gap-1.5 h-7 text-xs"
                title={useGpu ? "GPU Acceleration ON" : "GPU Acceleration OFF"}
              >
                <span className={useGpu ? "text-green-400" : "text-gray-400"}>⚡</span>
                {useGpu ? "GPU" : "CPU"}
              </Button>
              <Button variant="ghost" size="sm" onClick={openSettings} className="gap-1.5 h-7 text-xs">
                <Settings className="h-3 w-3" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={clearContext} className="gap-1.5 h-7 text-xs">
                <X className="h-3 w-3" />
                Change Project
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2.5 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="h-7 w-7 shrink-0">
                {message.role === 'user' && user?.avatar_url && (
                  <AvatarImage
                    src={getAvatarUrl(user.avatar_url, avatarCacheKey) || undefined}
                    alt={user.name}
                    key={avatarCacheKey}
                  />
                )}
                <AvatarFallback
                  className={
                    message.role === 'user'
                      ? 'bg-muted text-xs'
                      : 'bg-primary text-primary-foreground text-xs'
                  }
                >
                  {message.role === 'user' ? (user?.name?.split(' ').map(n => n[0]).join('') || 'You') : 'AI'}
                </AvatarFallback>
              </Avatar>
              <div
                className={`flex flex-col gap-0.5 max-w-[85%] ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`rounded-2xl px-3.5 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          a: ({ ...props }) => (
                            <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />
                          ),
                          code: CodeBlock
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground px-2">
                  {formatTime(message.created_at)}
                </span>
              </div>
            </div>
          ))}
          
          {/* Streaming message */}
          {/* Tool execution status indicator */}
          {toolStatus && (
            <div className="flex justify-center">
              <Badge 
                variant={toolStatus.status === 'executing' ? 'default' : toolStatus.status === 'success' ? 'outline' : 'destructive'}
                className="gap-1.5 py-1.5 px-3"
              >
                {toolStatus.status === 'executing' && <Loader2 className="h-3 w-3 animate-spin" />}
                {toolStatus.message || `Tool: ${toolStatus.tool}`}
              </Badge>
            </div>
          )}
          
          {isStreaming && streamingContent && (
            <div className="flex gap-2.5">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  AI
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5 max-w-[85%]">
                <div className="rounded-2xl px-3.5 py-2 bg-muted">
                  <p className="text-sm whitespace-pre-wrap">{streamingContent}</p>
                  <Loader2 className="h-3 w-3 animate-spin inline-block ml-1" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="border-t bg-muted/30 p-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isStreaming ? 'AI is responding...' : 'Ask me anything about ' + (currentProject?.name || 'your project') + '...'}
                className="min-h-[48px] max-h-32 resize-none pr-10 bg-background border-2 focus-visible:ring-2 text-sm"
                rows={1}
                disabled={isStreaming}
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 bottom-1 h-8 w-8"
                disabled
              >
                <Mic className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
            <Button
              size="icon"
              className="shrink-0 h-12 w-12"
              onClick={handleSendMessage}
              disabled={!input.trim() || isStreaming}
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      </div>
      
      {/* Document Viewer Panel (middle right) */}
      {viewingDocumentId && (
        <DocumentViewer
          documentId={viewingDocumentId}
          onClose={() => setViewingDocumentId(null)}
        />
      )}
      
      {/* Document Panel (far right) */}
      {projectId && (
        <DocumentPanel
          onViewDocument={setViewingDocumentId}
          isCollapsed={isRightPanelCollapsed}
          onToggleCollapse={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
        />
      )}

      {/* Project Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Project Settings</DialogTitle>
            <DialogDescription>
              Configure AI assistant behavior for {currentProject?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="settings-system-prompt">AI Assistant Instructions (Optional)</Label>
              <Textarea
                id="settings-system-prompt"
                placeholder="e.g., You are a patient tutor who explains concepts clearly and asks guiding questions..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Customize how the AI assistant behaves when chatting in this project. Changes apply to new conversations.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} disabled={updateProjectMutation.isPending}>
              {updateProjectMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Wrapper component that provides context
export function ChatPage() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('project')
  
  return (
    <ChatProvider projectId={projectId}>
      <ChatPageContent />
    </ChatProvider>
  )
}
