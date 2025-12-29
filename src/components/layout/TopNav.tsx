import { Link, useLocation, useNavigate } from 'react-router-dom'
import { GraduationCap, Home, FolderKanban, MessageSquare, FileText, Bot, LogOut, Settings, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeSelector } from '@/components/theme/ThemeSelector'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { getAvatarUrl } from '@/lib/config'

const navItems = [
  { title: 'Dashboard', path: '/', icon: Home },
  { title: 'Projects', path: '/projects', icon: FolderKanban },
  { title: 'Chat', path: '/chat', icon: MessageSquare },
  { title: 'Documents', path: '/documents', icon: FileText },
  { title: 'Agents', path: '/agents', icon: Bot },
]

export function TopNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, avatarCacheKey } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch {
      toast.error('Logout failed')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="w-full flex h-16 items-center px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl mr-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline-block text-primary">
            AI Study Buddy
          </span>
        </Link>

        <nav className="flex items-center gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.title}</span>
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2 ml-4">
          <ThemeSelector />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  {user?.avatar_url && (
                    <AvatarImage 
                      src={getAvatarUrl(user.avatar_url, avatarCacheKey) || undefined} 
                      alt={user.name}
                      key={avatarCacheKey}
                    />
                  )}
                  <AvatarFallback>
                    {user?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <UserCircle className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
