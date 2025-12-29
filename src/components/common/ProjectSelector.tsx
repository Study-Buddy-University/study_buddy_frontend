import { FolderKanban } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useActiveProject } from '@/hooks/useActiveProject'
import { Badge } from '@/components/ui/badge'

interface ProjectSelectorProps {
  className?: string
  showLabel?: boolean
}

export function ProjectSelector({ 
  className = '', 
  showLabel = true 
}: ProjectSelectorProps) {
  const { 
    activeProjectId, 
    setActiveProjectId, 
    allProjects, 
    activeProject,
    isLoadingProjects 
  } = useActiveProject()

  if (isLoadingProjects) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <FolderKanban className="h-4 w-4" />
        <span>Loading projects...</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabel && <FolderKanban className="h-4 w-4 text-muted-foreground shrink-0" />}
      <Select
        value={activeProjectId?.toString() || 'none'}
        onValueChange={(val) => setActiveProjectId(val === 'none' ? null : Number(val))}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Select active project" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-muted-foreground">No active project</span>
          </SelectItem>
          {allProjects.map((project) => (
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
      {activeProject && (
        <Badge variant="default" className="shrink-0">
          Active
        </Badge>
      )}
    </div>
  )
}
