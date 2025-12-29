import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Upload, Trash2, Eye, EyeOff, Loader2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { documentsService } from '@/services/documents'
import { getToolsByIds } from '@/lib/tools'
import { useChatContext } from '@/contexts/ChatContext'
import { CollapsedSidebar } from '@/components/chat/CollapsedSidebar'

interface Document {
  id: number
  filename: string
  file_type: string
  file_size: number
  created_at: string
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

interface DocumentPanelProps {
  onViewDocument?: (documentId: number) => void
  isCollapsed?: boolean
  onToggleCollapse: () => void
}

export function DocumentPanel({ onViewDocument, isCollapsed, onToggleCollapse }: DocumentPanelProps) {
  const { projectId, selectedDocuments, toggleDocument, setSelectedDocuments, currentProject } = useChatContext()
  const tools = currentProject?.tools || []
  const [uploading, setUploading] = useState(false)
  const queryClient = useQueryClient()

  // Fetch documents for project
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['project-documents', projectId],
    queryFn: async () => {
      if (!projectId) return []
      const docs = await documentsService.getDocumentsByProject(Number(projectId))
      return docs as unknown as Document[]
    },
    enabled: !!projectId,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => documentsService.deleteDocumentById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-documents', projectId] })
      toast.success('Document deleted')
    },
    onError: () => {
      toast.error('Failed to delete document')
    },
  })

  const handleToggleDocument = (id: number) => {
    toggleDocument(id)
  }

  const handleToggleAll = () => {
    if (selectedDocuments.length === documents.length) {
      setSelectedDocuments([])
    } else {
      setSelectedDocuments(documents.map(doc => doc.id))
    }
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setUploading(true)
    
    try {
      await documentsService.uploadDocument(Number(projectId), file)
      queryClient.invalidateQueries({ queryKey: ['project-documents', projectId] })
      toast.success('Document uploaded')
      event.target.value = ''
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Delete this document? It will be removed from all conversations.')) {
      deleteMutation.mutate(id)
      // Remove from selection if selected
      toggleDocument(id)
    }
  }

  const activeTools = getToolsByIds(tools)

  if (isCollapsed) {
    return (
      <CollapsedSidebar 
        label="Documents" 
        side="right" 
        onExpand={onToggleCollapse} 
      />
    )
  }

  return (
    <div className="w-80 max-w-[320px] border-l bg-muted/30 flex flex-col shrink-0">
      {/* Collapse Button */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-6 w-6"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <h3 className="text-xs font-semibold text-muted-foreground">DOCUMENTS</h3>
      </div>
      {/* Active Tools Section */}
      {activeTools.length > 0 && (
        <div className="p-4 border-b space-y-2">
          <h3 className="text-sm font-semibold">Active Tools</h3>
          <div className="flex flex-wrap gap-2">
            {activeTools.map((tool) => (
              <Badge key={tool.id} variant="outline" className="gap-1.5">
                <span>{tool.icon}</span>
                <span className="text-xs">{tool.name}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Documents</h3>
          <Badge variant="secondary">{documents.length}</Badge>
        </div>

        <div>
          <input
            type="file"
            id="doc-upload"
            className="hidden"
            accept=".pdf,.txt,.md,.doc,.docx"
            onChange={handleUpload}
            disabled={uploading}
          />
          <Button
            className="w-full gap-2"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('doc-upload')?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Document
              </>
            )}
          </Button>
        </div>

        {documents.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={handleToggleAll}
          >
            {selectedDocuments.length === documents.length ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Deselect All
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Select All
              </>
            )}
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {isLoading && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Loading documents...
            </div>
          )}

          {!isLoading && documents.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No documents yet. Upload one to use RAG.
            </div>
          )}

          {documents.map((doc) => {
            const isSelected = selectedDocuments.includes(doc.id)
            
            return (
              <div
                key={doc.id}
                className={cn(
                  'group relative rounded-lg border p-3 transition-all',
                  isSelected
                    ? 'bg-primary/10 border-primary'
                    : 'bg-background hover:bg-accent/50'
                )}
              >
                <div className="flex items-start gap-2">
                  <button
                    onClick={() => handleToggleDocument(doc.id)}
                    className="shrink-0 mt-0.5"
                  >
                    {isSelected ? (
                      <Eye className="h-4 w-4 text-primary" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  <button
                    onClick={() => onViewDocument?.(doc.id)}
                    className="flex-1 min-w-0 overflow-hidden text-left hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-start gap-2">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
                      <p className="text-sm font-medium break-all line-clamp-2">
                        {doc.filename}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatFileSize(doc.file_size)}
                    </p>
                  </button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>

                {isSelected && (
                  <div className="mt-2 pt-2 border-t">
                    <Badge variant="outline" className="text-xs">
                      Active in RAG
                    </Badge>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {selectedDocuments.length > 0 && (
        <div className="p-3 border-t bg-muted/50">
          <p className="text-xs text-muted-foreground text-center">
            {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} active for context
          </p>
        </div>
      )}
    </div>
  )
}
