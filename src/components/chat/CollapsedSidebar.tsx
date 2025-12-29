import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CollapsedSidebarProps {
  label: string
  side: 'left' | 'right'
  onExpand: () => void
}

export function CollapsedSidebar({ label, side, onExpand }: CollapsedSidebarProps) {
  const ChevronIcon = side === 'left' ? ChevronRight : ChevronLeft
  const borderClass = side === 'left' ? 'border-r' : 'border-l'
  
  return (
    <div className={`flex flex-col items-center w-12 ${borderClass} bg-muted/30 shrink-0`}>
      <div className="py-4 flex flex-col items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onExpand}
          className="h-8 w-8"
        >
          <ChevronIcon className="h-4 w-4" />
        </Button>
        
        {/* Vertical Label - Using writing-mode for consistent alignment */}
        <div className="mt-2 flex flex-col items-center">
          <div 
            className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary"
            style={{ 
              writingMode: 'vertical-rl' as const,
              textOrientation: 'mixed' as const
            }}
          >
            {label}
          </div>
        </div>
      </div>
    </div>
  )
}
