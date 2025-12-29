import { Palette, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useColorTheme } from '@/hooks/useColorTheme'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const colorThemes = [
  { value: 'caffeine', label: 'Caffeine', color: 'oklch(0.4341 0.0392 41.9938)' },
  { value: 'bubblegum', label: 'Bubblegum', color: 'oklch(0.6209 0.1801 348.1385)' },
  { value: 'candyland', label: 'Candyland', color: 'oklch(0.8677 0.0735 7.0855)' },
  { value: 'catppuccin', label: 'Catppuccin', color: 'oklch(0.5547 0.2503 297.0156)' },
  { value: 'claude', label: 'Claude', color: 'oklch(0.6171 0.1375 39.0427)' },
] as const

export function ThemeSelector() {
  const { setTheme } = useTheme()
  const { colorTheme, setColorTheme } = useColorTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Theme Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Mode
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Color Theme
        </DropdownMenuLabel>
        {colorThemes.map((ct) => (
          <DropdownMenuItem
            key={ct.value}
            onClick={() => setColorTheme(ct.value)}
          >
            <div
              className="mr-2 h-4 w-4 rounded-full border"
              style={{ backgroundColor: ct.color }}
            />
            {ct.label}
            {colorTheme === ct.value && ' ✓'}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
