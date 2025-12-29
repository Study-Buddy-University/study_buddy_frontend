import { useState, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Upload, Search, FileText, File, Download, Trash2, MessageSquare, FolderKanban, MoreVertical, Filter, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { documentsService } from '@/services/documents'
import { projectsService } from '@/services/projects'

interface DocumentItem {
  id: number
  filename: string
  file_type: string
  file_size: number
  project_id: number
  created_at: string
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
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

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <File className="h-5 w-5 text-red-500" />
    case 'doc':
      return <File className="h-5 w-5 text-blue-500" />
    case 'md':
      return <FileText className="h-5 w-5 text-purple-500" />
    case 'txt':
      return <FileText className="h-5 w-5 text-gray-500" />
    default:
      return <File className="h-5 w-5" />
  }
}

export function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewFilter, setViewFilter] = useState<string>('all')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  // Get active project from URL (single source of truth)
  const activeProjectId = searchParams.get('project') ? Number(searchParams.get('project')) : null

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsService.getProjects()
      return Array.isArray(response) ? response : []
    },
  })
  
  const activeProject = projects.find(p => p.id === activeProjectId)

  // Fetch documents
  const { data: allDocuments = [], isLoading } = useQuery({
    queryKey: ['documents', projects.map(p => p.id).sort().join(',')],
    queryFn: async () => {
      const docs: DocumentItem[] = []
      for (const project of projects) {
        try {
          const projectDocs = await documentsService.getDocumentsByProject(project.id)
          docs.push(...(projectDocs as unknown as DocumentItem[]))
        } catch (error) {
          // Skip projects that no longer exist (e.g., deleted)
          console.warn(`Skipping documents for project ${project.id}:`, error)
        }
      }
      return docs
    },
    enabled: projects.length > 0,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => documentsService.deleteDocumentById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Document deleted')
    },
    onError: () => {
      toast.error('Failed to delete document')
    },
  })

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Upload to active project
    if (!activeProjectId) {
      toast.error('Please select an active project first')
      return
    }

    setUploading(true)
    try {
      await documentsService.uploadDocument(activeProjectId, file)
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success(`Uploaded to ${activeProject?.name}`)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesView = viewFilter === 'all' || doc.project_id === Number(viewFilter)
    return matchesSearch && matchesView
  })

  const handleDelete = (id: number, isActive: boolean) => {
    // Warn if deleting from non-active project
    if (!isActive) {
      const confirmed = window.confirm(
        'This document belongs to a different project. Are you sure you want to delete it?'
      )
      if (!confirmed) return
    }
    
    if (confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-2">
            Upload and manage your study materials
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            className="hidden"
            accept=".pdf,.txt,.md,.doc,.docx"
          />
          <Button 
            size="lg" 
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Active Project Selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Active Project:</label>
          <Select
            value={activeProjectId?.toString() || 'none'}
            onValueChange={(val) => {
              if (val === 'none') {
                navigate('/documents')
              } else {
                navigate(`/documents?project=${val}`)
              }
            }}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select active project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <span className="text-muted-foreground">No active project</span>
              </SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: project.color }}
                    />
                    <span>{project.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!activeProjectId && (
            <span className="text-sm text-muted-foreground">Select a project to enable chat</span>
          )}
        </div>
        
        {/* View Filter */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">View:</label>
          <Select value={viewFilter} onValueChange={setViewFilter}>
            <SelectTrigger className="w-[220px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter documents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Documents</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                <p className="text-2xl font-bold mt-1">{allDocuments.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Size</p>
                <p className="text-2xl font-bold mt-1">{formatFileSize(allDocuments.reduce((sum, d) => sum + d.file_size, 0))}</p>
              </div>
              <FolderKanban className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">PDF Files</p>
                <p className="text-2xl font-bold mt-1">{allDocuments.filter(d => d.file_type.includes('pdf')).length}</p>
              </div>
              <File className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Chats</p>
                <p className="text-2xl font-bold mt-1">-</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        {isLoading && (
          <div className="text-center py-8 text-muted-foreground">Loading documents...</div>
        )}
        
        {!isLoading && filteredDocuments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No documents found. Upload your first document to get started!
          </div>
        )}
        
        {filteredDocuments.map((doc) => {
          const isActive = doc.project_id === activeProjectId
          const project = projects.find(p => p.id === doc.project_id)
          
          return (
            <Card key={doc.id} className={cn(
              "hover:shadow-md transition-all",
              !isActive && "opacity-70"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Project Color Dot */}
                  <div 
                    className="w-3 h-3 rounded-full shrink-0" 
                    style={{ backgroundColor: project?.color || '#999' }}
                  />
                  
                  {/* File Icon */}
                  <div className="shrink-0">
                    {getFileIcon(doc.file_type)}
                  </div>

                  {/* Document Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{doc.filename}</h3>
                      <Badge 
                        variant={isActive ? "default" : "secondary"}
                        className="shrink-0 text-xs cursor-pointer hover:opacity-80"
                        onClick={() => navigate(`/documents?project=${doc.project_id}`)}
                        title="Click to switch active project"
                      >
                        {project?.name || 'Unknown'}
                      </Badge>
                      {isActive && (
                        <Badge variant="outline" className="shrink-0 text-xs border-green-500 text-green-600">
                          ACTIVE
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(doc.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link 
                      to={`/chat?project=${doc.project_id}&document=${doc.id}`}
                      onClick={(e) => !isActive && e.preventDefault()}
                    >
                      <Button 
                        variant="default" 
                        size="sm" 
                        disabled={!isActive}
                        title={!isActive ? `Switch to "${project?.name}" to chat` : 'Chat with this document'}
                        className="gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Chat
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" title="Download document">
                      <Download className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Move to Project</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(doc.id, isActive)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No documents found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || viewFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Upload your first document to get started'}
          </p>
          {!searchQuery && viewFilter === 'all' && (
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Documents
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
