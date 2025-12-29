import { createBrowserRouter, redirect } from 'react-router-dom'
import { BaseLayout } from '@/components/layout/BaseLayout'
import { ChatLayout } from '@/components/layout/ChatLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { ProjectsPage } from '@/pages/projects/ProjectsPage'
import { ChatPage } from '@/pages/chat/ChatPage'
import { DocumentsPage } from '@/pages/documents/DocumentsPage'
import { AgentsPage } from '@/pages/agents/AgentsPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SignupPage } from '@/pages/auth/SignupPage'

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <BaseLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'projects',
            element: <ProjectsPage />,
          },
          {
            path: 'documents',
            element: <DocumentsPage />,
          },
          {
            path: 'agents',
            element: <AgentsPage />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
      },
      {
        path: '/chat',
        element: <ChatLayout />,
        loader: async ({ request }) => {
          // Check if project param exists in URL
          const url = new URL(request.url)
          const projectId = url.searchParams.get('project')
          
          // If no project in URL, try to restore from localStorage
          if (!projectId && typeof window !== 'undefined') {
            const lastProjectId = localStorage.getItem('last_project_id')
            if (lastProjectId) {
              // Preserve other params (conversation, document)
              const params = new URLSearchParams(url.search)
              params.set('project', lastProjectId)
              return redirect(`/chat?${params.toString()}`)
            }
          }
          
          return null
        },
        children: [
          {
            index: true,
            element: <ChatPage />,
          },
        ],
      },
    ],
  },
])
