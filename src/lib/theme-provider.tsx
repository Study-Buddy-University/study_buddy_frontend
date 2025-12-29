import { useState } from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ThemeProviderProps as NextThemesProviderProps } from 'next-themes'
import { ThemeContext, type ColorTheme } from './theme-context'

export function ThemeProvider({ children, ...props }: NextThemesProviderProps) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    const stored = localStorage.getItem('color-theme') as ColorTheme
    if (stored) {
      document.documentElement.setAttribute('data-color-theme', stored)
      return stored
    }
    return 'caffeine'
  })

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme)
    localStorage.setItem('color-theme', theme)
    document.documentElement.setAttribute('data-color-theme', theme)
  }

  return (
    <ThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      <NextThemesProvider {...props}>
        {children}
      </NextThemesProvider>
    </ThemeContext.Provider>
  )
}
