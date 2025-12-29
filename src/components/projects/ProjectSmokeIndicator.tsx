import { SmokeCanvas } from '@/components/effects/SmokeCanvas'

interface ProjectSmokeIndicatorProps {
  className?: string
}

export function ProjectSmokeIndicator({ className = '' }: ProjectSmokeIndicatorProps) {
  return (
    <div className={`w-2 h-12 rounded-sm shrink-0 relative overflow-hidden bg-linear-to-b from-primary/5 via-primary/10 to-primary/5 ${className}`}>
      <SmokeCanvas className="absolute inset-0" />
    </div>
  )
}
