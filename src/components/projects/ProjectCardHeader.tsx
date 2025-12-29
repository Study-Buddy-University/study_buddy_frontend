import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { SmokeCanvas } from '@/components/effects/SmokeCanvas'

interface ProjectCardHeaderProps {
  projectName: string
  agentName?: string
  onEdit: () => void
  onDelete: () => void
}

export function ProjectCardHeader({ projectName, agentName, onEdit, onDelete }: ProjectCardHeaderProps) {
  return (
    <div>
      <div className="flex items-center justify-between px-4 pt-3 pb-0.5">
        <h3 className="text-base font-semibold truncate text-foreground">
          {projectName}
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7">
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="h-7 relative overflow-hidden bg-linear-to-r from-primary/5 via-primary/10 to-primary/5">
        <SmokeCanvas className="absolute inset-0" />
        {agentName && (
          <div className="relative z-10 flex items-center h-full px-4">
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-background/90 backdrop-blur-sm text-foreground">
              <span className="mr-1">🤖</span>
              {agentName}
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}
