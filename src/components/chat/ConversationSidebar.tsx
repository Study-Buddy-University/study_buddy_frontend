import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Plus, Search, MessageSquare, MoreVertical, Pencil, Trash2, ChevronLeft } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { CollapsedSidebar } from '@/components/chat/CollapsedSidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { chatService } from '@/services/chat'

interface Conversation {
  id: number
  title: string
  project_id: number
  created_at: string
  updated_at: string
}

function formatRelativeTime(dateString: string): string {
  const now = new Date()
  const past = new Date(dateString)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return past.toLocaleDateString()
}

interface ConversationSidebarProps {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function ConversationSidebar({ 
  isCollapsed: isCollapsedProp, 
  onToggleCollapse 
}: ConversationSidebarProps = {}) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [editingConversation, setEditingConversation] = useState<Conversation | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [deletingConversation, setDeletingConversation] = useState<Conversation | null>(null)
  const [isCollapsedInternal, setIsCollapsedInternal] = useState(false)
  
  // Use prop if provided, otherwise use internal state
  const isCollapsed = isCollapsedProp ?? isCollapsedInternal
  const handleToggleCollapse = onToggleCollapse ?? (() => setIsCollapsedInternal(!isCollapsedInternal))
  
  const projectId = searchParams.get('project')
  const conversationId = searchParams.get('conversation')

  // Fetch conversations for current project
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations', projectId],
    queryFn: async () => {
      if (!projectId) return []
      const response = await api.get<Conversation[]>(`/projects/${projectId}/conversations`)
      return Array.isArray(response) ? response : []
    },
    enabled: !!projectId,
  })

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleNewChat = () => {
    if (projectId) {
      // Remove conversation param to start fresh chat
      navigate(`/chat?project=${projectId}`)
    }
  }

  const handleSelectConversation = (convId: number) => {
    if (projectId) {
      navigate(`/chat?project=${projectId}&conversation=${convId}`)
    }
  }

  const handleEditConversation = (conversation: Conversation) => {
    setEditingConversation(conversation)
    setEditTitle(conversation.title || '')
  }

  const handleDeleteConversation = (conversation: Conversation) => {
    setDeletingConversation(conversation)
  }

  const updateMutation = useMutation({
    mutationFn: async ({ id, title }: { id: number; title: string }) => {
      await chatService.updateConversation(id, { title })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', projectId] })
      setEditingConversation(null)
      setEditTitle('')
      toast.success('Conversation title updated')
    },
    onError: () => {
      toast.error('Failed to update title')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await chatService.deleteConversation(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', projectId] })
      setDeletingConversation(null)
      toast.success('Conversation deleted')
      // If we deleted the current conversation, go back to project chat
      if (deletingConversation && Number(conversationId) === deletingConversation.id) {
        navigate(`/chat?project=${projectId}`)
      }
    },
    onError: () => {
      toast.error('Failed to delete conversation')
    },
  })

  const handleSaveTitle = () => {
    if (!editingConversation || !editTitle.trim()) return
    updateMutation.mutate({ id: editingConversation.id, title: editTitle.trim() })
  }

  const handleConfirmDelete = () => {
    if (!deletingConversation) return
    deleteMutation.mutate(deletingConversation.id)
  }

  if (isCollapsed) {
    return (
      <CollapsedSidebar 
        label="Conversations" 
        side="left" 
        onExpand={handleToggleCollapse} 
      />
    )
  }

  return (
    <div className="w-80 border-r bg-muted/30 flex flex-col shrink-0">
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-muted-foreground">CONVERSATIONS</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleCollapse}
            className="h-6 w-6"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <Button className="w-full justify-start gap-2" onClick={handleNewChat}>
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading conversations...
            </div>
          )}
          
          {!isLoading && !projectId && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Select a project to view conversations
            </div>
          )}
          
          {!isLoading && projectId && filteredConversations.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchQuery ? 'No conversations found' : 'No conversations yet. Start a new chat!'}
            </div>
          )}
          
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                'group relative rounded-lg hover:bg-accent/50 transition-all duration-200',
                Number(conversationId) === conversation.id && 'bg-accent border-l-2 border-primary'
              )}
            >
              <button
                onClick={() => handleSelectConversation(conversation.id)}
                className="w-full text-left p-3 pr-8"
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm wrap-break-words">
                      {conversation.title || 'Untitled Chat'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(conversation.updated_at)}
                    </div>
                  </div>
                </div>
              </button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditConversation(conversation)}>
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Edit Title
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteConversation(conversation)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Edit Title Dialog */}
      <Dialog open={!!editingConversation} onOpenChange={(open) => !open && setEditingConversation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Conversation Title</DialogTitle>
            <DialogDescription>
              Change the title of this conversation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter conversation title..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSaveTitle()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingConversation(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTitle} disabled={!editTitle.trim() || updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingConversation} onOpenChange={(open) => !open && setDeletingConversation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingConversation?.title || 'this conversation'}"?
              This action cannot be undone and all messages will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
