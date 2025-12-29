import { X, Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { documentsService } from '@/services/documents'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface DocumentViewerProps {
  documentId: number
  onClose: () => void
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export function DocumentViewer({ documentId, onClose }: DocumentViewerProps) {
  const { data: document, isLoading } = useQuery({
    queryKey: ['document-content', documentId],
    queryFn: async () => {
      const doc = await documentsService.getDocument(documentId.toString())
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/documents/${documentId}/content`)
      const content = await response.text()
      
      return { ...doc, content }
    },
    enabled: !!documentId,
  })

  const isMarkdown = document?.name?.match(/\.(md|markdown)$/i)
  const isText = document?.type === 'txt' || document?.type === 'md' || document?.type === 'text'

  return (
    <div className="w-96 max-w-[400px] border-l bg-background flex flex-col shrink-0">
      <div className="p-4 border-b space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1 break-all line-clamp-2">
              {document?.name || 'Loading...'}
            </h3>
            {document && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  {formatFileSize(document.size)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {document.type?.toUpperCase() || 'UNKNOWN'}
                </Badge>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => {
              const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/documents/${documentId}/download`
              window.open(url, '_blank')
            }}
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => {
              const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/documents/${documentId}/content`
              window.open(url, '_blank')
            }}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Loading document...
            </div>
          )}

          {!isLoading && document && (
            <div className="text-sm">
              {isMarkdown ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />
                      ),
                    }}
                  >
                    {document.content}
                  </ReactMarkdown>
                </div>
              ) : isText ? (
                <pre className="whitespace-pre-wrap font-mono text-xs bg-muted/50 p-3 rounded-lg">
                  {document.content}
                </pre>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <p className="mb-2">Preview not available for this file type</p>
                  <p className="text-xs">Use the download button to view the file</p>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
