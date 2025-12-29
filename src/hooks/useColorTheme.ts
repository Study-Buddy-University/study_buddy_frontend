import { useContext } from 'react'
import { ThemeContext } from '@/lib/theme-context'

export function useColorTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useColorTheme must be used within ThemeProvider')
  }
  return context
}
