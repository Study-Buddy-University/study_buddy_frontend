import { SidebarTrigger } from '@/components/ui/sidebar'

export function AppHeader() {
  return (
    <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <div className="flex-1" />
    </header>
  )
}
