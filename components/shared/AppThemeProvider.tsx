'use client'

import { useEffect } from 'react'

type ThemeMode = 'light' | 'dark' | 'system'

type AppThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: ThemeMode
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark)

  if (isDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function AppThemeProvider({ children, defaultTheme = 'system' }: AppThemeProviderProps) {
  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as ThemeMode | null) ?? defaultTheme
    applyTheme(savedTheme)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const onSystemThemeChange = () => {
      const currentTheme = (localStorage.getItem('theme') as ThemeMode | null) ?? defaultTheme
      if (currentTheme === 'system') applyTheme('system')
    }

    mediaQuery.addEventListener('change', onSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', onSystemThemeChange)
  }, [defaultTheme])

  return <>{children}</>
}
