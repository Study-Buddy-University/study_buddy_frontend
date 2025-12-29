import { createContext } from 'react'

export type ColorTheme = 'caffeine' | 'bubblegum' | 'candyland' | 'catppuccin' | 'claude'

export interface ThemeContextType {
  colorTheme: ColorTheme
  setColorTheme: (theme: ColorTheme) => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)
