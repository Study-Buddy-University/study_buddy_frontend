import { Outlet } from 'react-router-dom'
import { TopNav } from './TopNav'

export function ChatLayout() {
  return (
    <div className="h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
