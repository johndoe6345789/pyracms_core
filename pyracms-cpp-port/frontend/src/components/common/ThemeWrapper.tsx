'use client'

import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { lightTheme, darkTheme } from '@/lib/theme'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { useMemo, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAuthHydration } from '@/hooks/useAuthHydration'

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  useAuthHydration()
  const colorMode = useSelector((state: RootState) => state.ui.colorMode)
  const [systemDark, setSystemDark] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemDark(mq.matches)
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const theme = useMemo(() => {
    if (colorMode === 'system') {
      return systemDark ? darkTheme : lightTheme
    }
    return colorMode === 'dark' ? darkTheme : lightTheme
  }, [colorMode, systemDark])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AnimatePresence mode="wait">
        {children}
      </AnimatePresence>
    </ThemeProvider>
  )
}
