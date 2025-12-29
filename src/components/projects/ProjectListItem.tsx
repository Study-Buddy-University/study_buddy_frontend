import { Link } from 'react-router-dom'
import { MessageSquare, Calendar, MoreVertical, Pencil, Trash2, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ProjectSmokeIndicator } from './ProjectSmokeIndicator'
import type { Project } from '@/types/api'

interface ProjectListItemProps {
  project: Project
  onEdit: () => void
  onDelete: () => void
}

export function ProjectListItem({ project, onEdit, onDelete }: ProjectListItemProps) {
  return (
    <Card className="group hover:shadow-sm transition-all duration-200 border-muted">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <ProjectSmokeIndicator />

          {/* Project Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {project.description || 'No description'}
                </p>
                {/* Stats */}
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="h-3 w-3" />
                    <span className="font-semibold text-foreground px-2 py-0.5 rounded bg-primary/10">{project.conversation_count ?? '—'}</span> chats
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    <span className="font-semibold text-foreground px-2 py-0.5 rounded bg-primary/10">{project.message_count ?? '—'}</span> msgs
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-3 w-3" />
                    <span className="font-semibold text-foreground px-2 py-0.5 rounded bg-primary/10">{project.document_count ?? '—'}</span> docs
                  </div>
                </div>
              </div>

              {/* Time */}
              <div className="text-[11px] text-muted-foreground shrink-0">
                <Calendar className="h-3 w-3 inline mr-1" />
                {new Date(project.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Link to={`/chat?project=${project.id}`}>
              <Button variant="default" size="sm" className="gap-1.5 h-8 text-xs">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Open</span>
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
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
        </div>
      </CardContent>
    </Card>
  )
}
