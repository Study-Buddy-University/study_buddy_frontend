import { useQuery } from '@tanstack/react-query'
import { Activity, FileText, MessageSquare, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { statsService } from '@/services/stats'

interface ChatStatsProps {
  conversationId: number | null
  documentCount?: number
}

export function ChatStats({ conversationId, documentCount = 0 }: ChatStatsProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['conversation-stats', conversationId],
    queryFn: () => conversationId ? statsService.getConversationStats(conversationId) : null,
    enabled: !!conversationId,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  if (isLoading || !stats || !conversationId) {
    return (
      <div className="flex items-center gap-3 text-xs text-muted-foreground animate-pulse">
        <div className="h-4 w-24 bg-muted rounded" />
      </div>
    )
  }

  const getUsageColor = (percentage: number) => {
    if (percentage > 80) return 'text-destructive'
    if (percentage > 60) return 'text-orange-500'
    return 'text-muted-foreground'
  }

  const getProgressColor = (percentage: number) => {
    if (percentage > 80) return 'bg-destructive'
    if (percentage > 60) return 'bg-orange-500'
    return 'bg-primary'
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      <TooltipProvider>
        {/* Token Usage */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-help">
              <Badge variant="outline" className="gap-1.5 font-normal">
                <Zap className={`h-3 w-3 ${getUsageColor(stats.usage_percentage)}`} />
                <span className={getUsageColor(stats.usage_percentage)}>
                  {stats.total_tokens.toLocaleString()} / {stats.max_tokens.toLocaleString()}
                </span>
              </Badge>
              <div className="w-16 hidden sm:block">
                <Progress 
                  value={stats.usage_percentage} 
                  className="h-1.5"
                  indicatorClassName={getProgressColor(stats.usage_percentage)}
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              <p className="font-semibold">Context Window Usage</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Used:</span>
                  <span className="font-mono">{stats.total_tokens.toLocaleString()} tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span className="font-mono">{stats.remaining_tokens.toLocaleString()} tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>Usage:</span>
                  <span className="font-mono">{stats.usage_percentage.toFixed(1)}%</span>
                </div>
              </div>
              {stats.is_near_limit && (
                <p className="text-destructive font-medium">⚠️ Near context limit!</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4" />

        {/* Message Count */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-help">
              <MessageSquare className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{stats.message_count}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{stats.message_count} message{stats.message_count !== 1 ? 's' : ''} in conversation</p>
          </TooltipContent>
        </Tooltip>

        {/* Document Count */}
        {documentCount > 0 && (
          <>
            <Separator orientation="vertical" className="h-4" />
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-help">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{documentCount}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{documentCount} document{documentCount !== 1 ? 's' : ''} available</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}

        {/* Activity Indicator */}
        {stats.is_near_limit && (
          <>
            <Separator orientation="vertical" className="h-4" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="destructive" className="gap-1">
                  <Activity className="h-3 w-3" />
                  <span className="hidden sm:inline">Near Limit</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Context window is over 80% full. Consider starting a new conversation.</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </TooltipProvider>
    </div>
  )
}
