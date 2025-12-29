import { Outlet } from 'react-router-dom'
import { TopNav } from './TopNav'

export function BaseLayout() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <TopNav />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
