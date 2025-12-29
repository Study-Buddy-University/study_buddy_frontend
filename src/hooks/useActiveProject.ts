import { useContext } from 'react'
import { ActiveProjectContext } from '@/contexts/ActiveProjectContext'

export function useActiveProject() {
  const context = useContext(ActiveProjectContext)
  if (!context) {
    throw new Error('useActiveProject must be used within ActiveProjectProvider')
  }
  return context
}
