import { Link } from 'react-router-dom'
import { MessageSquare, FolderKanban, Calendar, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProjectCardHeader } from './ProjectCardHeader'
import type { Project } from '@/types/api'

interface ProjectGridCardProps {
  project: Project
  onEdit: () => void
  onDelete: () => void
}

export function ProjectGridCard({ project, onEdit, onDelete }: ProjectGridCardProps) {
  return (
    <Card className="group hover:shadow-md transition-all duration-200 overflow-hidden border-muted">
      <ProjectCardHeader
        projectName={project.name}
        agentName={project.agent_name}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <CardHeader className="pb-3 pt-3 px-4">
        <CardDescription className="line-clamp-2 text-xs">
          {project.description || 'No description'}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-4 pb-3 pt-0">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-3 pb-3 border-b text-center">
          <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground text-sm px-3 py-1 rounded-md bg-primary/10">
              {project.conversation_count ?? '—'}
            </span>
            <span className="text-[10px]">chats</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground text-sm px-3 py-1 rounded-md bg-primary/10">
              {project.message_count ?? '—'}
            </span>
            <span className="text-[10px]">msgs</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground text-sm px-3 py-1 rounded-md bg-primary/10">
              {project.document_count ?? '—'}
            </span>
            <span className="text-[10px]">docs</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link to={`/chat?project=${project.id}`} className="flex-1">
            <Button variant="default" className="w-full gap-1.5 h-8 text-xs" size="sm">
              <MessageSquare className="h-3.5 w-3.5" />
              Open Chat
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="h-8 px-2">
            <FolderKanban className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
