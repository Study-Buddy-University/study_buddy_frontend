import { useState } from 'react'
import { Plus, Search, Grid3x3, List, ArrowUpDown } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { projectsService } from '@/services/projects'
import type { Project, CreateProjectRequest } from '@/types/api'
import { SystemPromptLibrary } from '@/components/projects/SystemPromptLibrary'
import type { SystemPromptTemplate } from '@/lib/system-prompts'
import { ToolSelector } from '@/components/agents/ToolSelector'
import { ProjectGridCard } from '@/components/projects/ProjectGridCard'
import { ProjectListItem } from '@/components/projects/ProjectListItem'

type ViewMode = 'grid' | 'list'
type SortBy = 'name' | 'created' | 'updated'

export function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('created')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '', color: '#3b82f6', agent_name: '', system_prompt: '', tools: [] as string[] })
  
  const queryClient = useQueryClient()

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsService.getProjects()
      // Backend returns array directly, not paginated response
      return Array.isArray(response) ? response : []
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectRequest) => projectsService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created successfully')
      setIsCreateDialogOpen(false)
      setFormData({ name: '', description: '', color: '#3b82f6', agent_name: '', system_prompt: '', tools: [] })
    },
    onError: () => {
      toast.error('Failed to create project')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; description?: string; color?: string; agent_name?: string; system_prompt?: string; tools?: string[] } }) =>
      projectsService.updateProject(String(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project updated successfully')
      setIsEditDialogOpen(false)
      setEditingProject(null)
    },
    onError: () => {
      toast.error('Failed to update project')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => projectsService.deleteProject(String(id)),
    onSuccess: () => {
      // Invalidate all related queries to update UI across all pages
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['stats-overview'] })
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Project deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete project')
    },
  })
  const filteredProjects = projects
    .filter(project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        default:
          return 0
      }
    })

  const handleCreateProject = () => {
    if (!formData.name.trim()) {
      toast.error('Project name is required')
      return
    }
    createMutation.mutate(formData)
  }

  const handleEditProject = () => {
    if (!editingProject || !formData.name.trim()) return
    updateMutation.mutate({
      id: editingProject.id,
      data: { 
        name: formData.name, 
        description: formData.description, 
        color: formData.color,
        agent_name: formData.agent_name,
        system_prompt: formData.system_prompt,
        tools: formData.tools
      },
    })
  }

  const handleDeleteProject = (id: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteMutation.mutate(id)
    }
  }

  const openEditDialog = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description || '',
      color: project.color,
      agent_name: project.agent_name || '',
      system_prompt: project.system_prompt || '',
      tools: project.tools || []
    })
    setIsEditDialogOpen(true)
  }

  const openCreateDialog = () => {
    setFormData({ name: '', description: '', color: '#3b82f6', agent_name: '', system_prompt: '', tools: [] })
    setIsCreateDialogOpen(true)
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize your learning into focused study projects
          </p>
        </div>
        <Button size="default" className="gap-2" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          {/* Sort */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
            <SelectTrigger className="w-[160px] h-9">
              <ArrowUpDown className="h-3.5 w-3.5 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">Recent First</SelectItem>
              <SelectItem value="updated">Recently Updated</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6" />

          {/* View Toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none h-9 px-3"
            >
              <Grid3x3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none h-9 px-3"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Project Count */}
      {!isLoading && projects.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {filteredProjects.length} of {projects.length} project{projects.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-1 bg-muted" />
              <CardHeader className="pb-2">
                <div className="h-5 bg-muted rounded mb-1.5" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Projects Grid View */}
      {!isLoading && viewMode === 'grid' && <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <ProjectGridCard
            key={project.id}
            project={project}
            onEdit={() => openEditDialog(project)}
            onDelete={() => handleDeleteProject(project.id)}
          />
        ))}
      </div>}

      {/* Projects List View */}
      {!isLoading && viewMode === 'list' && (
        <div className="space-y-1.5">
          {filteredProjects.map((project) => (
            <ProjectListItem
              key={project.id}
              project={project}
              onEdit={() => openEditDialog(project)}
              onDelete={() => handleDeleteProject(project.id)}
            />
          ))}
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project to organize your learning materials
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="e.g., Machine Learning Basics"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="What will you study in this project?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <SystemPromptLibrary
                onSelect={(template: SystemPromptTemplate) => 
                  setFormData({ 
                    ...formData, 
                    agent_name: template.name,
                    system_prompt: template.prompt,
                    tools: template.requiredTools || []  // Auto-select required tools
                  })
                }
                selectedPrompt={formData.system_prompt}
              />
              <Label htmlFor="system-prompt">
                Assigned Agent: {formData.agent_name ? (
                  <Badge variant="secondary" className="ml-2">{formData.agent_name}</Badge>
                ) : (
                  <span className="text-muted-foreground ml-2">None</span>
                )}
              </Label>
              <Textarea
                id="system-prompt"
                placeholder="System prompt will appear here when you select an agent..."
                value={formData.system_prompt}
                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <ToolSelector
                selectedTools={formData.tools}
                onToolToggle={(toolId) => {
                  setFormData({
                    ...formData,
                    tools: formData.tools.includes(toolId)
                      ? formData.tools.filter(t => t !== toolId)
                      : [...formData.tools, toolId]
                  })
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Project Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <SystemPromptLibrary
                onSelect={(template: SystemPromptTemplate) => 
                  setFormData({ 
                    ...formData, 
                    agent_name: template.name,
                    system_prompt: template.prompt,
                    tools: template.requiredTools || []  // Auto-select required tools
                  })
                }
                selectedPrompt={formData.system_prompt}
              />
              <Label htmlFor="edit-system-prompt">
                Assigned Agent: {formData.agent_name ? (
                  <Badge variant="secondary" className="ml-2">{formData.agent_name}</Badge>
                ) : (
                  <span className="text-muted-foreground ml-2">None</span>
                )}
              </Label>
              <Textarea
                id="edit-system-prompt"
                placeholder="System prompt will appear here when you select an agent..."
                value={formData.system_prompt}
                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <ToolSelector
                selectedTools={formData.tools}
                onToolToggle={(toolId) => {
                  setFormData({
                    ...formData,
                    tools: formData.tools.includes(toolId)
                      ? formData.tools.filter(t => t !== toolId)
                      : [...formData.tools, toolId]
                  })
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProject} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
