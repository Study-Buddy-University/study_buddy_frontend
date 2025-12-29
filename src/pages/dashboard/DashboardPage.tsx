import { MessageSquare, FolderKanban, FileText, TrendingUp, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { WireframeLandscape } from '@/components/effects/WireframeLandscape'
import { SmokeCanvas } from '@/components/effects/SmokeCanvas'

interface StatsOverview {
  totals: {
    projects: number
    conversations: number
    messages: number
    documents: number
  }
  recent_projects: Array<{
    id: number
    name: string
    color: string
    updated_at: string
  }>
  recent_conversations: Array<{
    id: number
    title: string
    project_id: number
    updated_at: string
  }>
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

export function DashboardPage() {
  const { data: stats, isLoading } = useQuery<StatsOverview>({
    queryKey: ['stats-overview'],
    queryFn: async () => {
      const response = await api.get<StatsOverview>('/stats/overview')
      return response
    },
  })
  return (
    <div className="container max-w-7xl mx-auto py-8 space-y-8 px-4">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary to-primary/80 shadow-xl min-h-[420px]">
        <div className="absolute inset-0 opacity-50">
          <WireframeLandscape />
        </div>
        
        <div className="absolute top-0 left-0 right-0 h-[200px] overflow-hidden opacity-60">
          <SmokeCanvas />
        </div>
        
        <div className="relative z-10 flex flex-col justify-end min-h-[420px] px-10 md:px-16 pt-4 pb-8 text-primary-foreground">
          <div className="max-w-5xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Welcome to AI Study Buddy
            </h1>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <Link to="/chat">
                <Button size="lg" variant="secondary" className="gap-3 h-14 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow">
                  <MessageSquare className="h-6 w-6" />
                  Start Learning
                </Button>
              </Link>
              <p className="text-lg md:text-xl opacity-90 max-w-xl leading-relaxed">
                Your intelligent companion for effective learning and knowledge retention
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totals.projects || 0}</div>
                <p className="text-xs text-muted-foreground">Active projects</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Chat Sessions</CardTitle>
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-3xl font-bold">{stats?.totals.conversations || 0}</div>
                <p className="text-xs text-muted-foreground">Total conversations</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Documents</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-3xl font-bold">{stats?.totals.documents || 0}</div>
                <p className="text-xs text-muted-foreground">Across all projects</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Learning Streak</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-3xl font-bold">{stats?.totals.messages || 0}</div>
                <p className="text-xs text-muted-foreground">Total messages</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest learning sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : stats?.recent_conversations && stats.recent_conversations.length > 0 ? (
              <div className="space-y-4">
                {stats.recent_conversations.slice(0, 5).map((conv) => (
                  <Link 
                    key={conv.id} 
                    to={`/chat?project=${conv.project_id}&conversation=${conv.id}`}
                    className="flex items-center gap-4 hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm font-medium truncate">{conv.title || 'Untitled Chat'}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(conv.updated_at)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No recent activity yet. Start a conversation!</p>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/chat">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                New Chat
              </Button>
            </Link>
            <Link to="/projects">
              <Button variant="outline" className="w-full justify-start">
                <FolderKanban className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </Link>
            <Link to="/documents">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
