import { createContext, useState, useEffect, useRef, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { projectsService } from '@/services/projects'

interface Project {
  id: number
  name: string
  description?: string
  color: string
  agent_name?: string
  system_prompt?: string
  tools?: string[]
  created_at: string
  updated_at: string
}

interface ActiveProjectContextType {
  activeProjectId: number | null
  setActiveProjectId: (id: number | null) => void
  activeProject: Project | undefined
  allProjects: Project[]
  isLoadingProjects: boolean
}

const ActiveProjectContext = createContext<ActiveProjectContextType | undefined>(undefined)

interface ActiveProjectProviderProps {
  children: ReactNode
}

export function ActiveProjectProvider({ children }: ActiveProjectProviderProps) {
  const [activeProjectId, setActiveProjectIdState] = useState<number | null>(() => {
    const stored = localStorage.getItem('active_project_id')
    if (stored && stored !== 'null') {
      return Number(stored)
    }
    return null
  })

  // Track if we've already initialized to prevent re-initialization
  const hasInitialized = useRef(false)

  const { data: allProjects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsService.getProjects()
      return Array.isArray(response) ? response : []
    },
  })

  const activeProject = allProjects.find(p => p.id === activeProjectId)

  // Persist active project to localStorage
  useEffect(() => {
    if (activeProjectId === null) {
      localStorage.setItem('active_project_id', 'null')
    } else {
      localStorage.setItem('active_project_id', activeProjectId.toString())
    }
  }, [activeProjectId])

  // Auto-select first project on initial load if no stored preference (2025 best practice)
  useEffect(() => {
    // Only run once when projects load
    if (!hasInitialized.current && !isLoadingProjects && allProjects.length > 0) {
      const stored = localStorage.getItem('active_project_id')
      // Only auto-select if never set before (not even 'null')
      if (stored === null && activeProjectId === null) {
        // Use queueMicrotask to defer state update and avoid cascading render warning
        // This is initialization logic that should run once after data loads
        queueMicrotask(() => {
          setActiveProjectIdState(allProjects[0].id)
        })
      }
      hasInitialized.current = true
    }
  }, [isLoadingProjects, allProjects, activeProjectId])

  const setActiveProjectId = (id: number | null) => {
    setActiveProjectIdState(id)
  }

  const value: ActiveProjectContextType = {
    activeProjectId,
    setActiveProjectId,
    activeProject,
    allProjects,
    isLoadingProjects,
  }

  return (
    <ActiveProjectContext.Provider value={value}>
      {children}
    </ActiveProjectContext.Provider>
  )
}

export { ActiveProjectContext }
