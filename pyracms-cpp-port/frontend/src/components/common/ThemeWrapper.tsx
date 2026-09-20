'use client'

import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { lightTheme, darkTheme } from '@/lib/theme'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { useMemo, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAuthHydration } from '@/hooks/useAuthHydration'
import { usePathname } from 'next/navigation'
import { slugFromPath } from '@/lib/siteSlug'
import { useSiteTheme } from '@/hooks/useSiteTheme'
import { applySiteTheme } from '@/lib/siteTheme'
import { useSiteSettings } from '@/hooks/useSiteSettings'

export default function ThemeWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  useAuthHydration()
  const slug = slugFromPath(usePathname())
  const site = useSiteTheme(slug)
  const siteMode = useSiteSettings(slug)?.default_theme ?? 'system'
  const picked = useSelector((state: RootState) => state.ui.colorMode)
  const colorMode = picked === 'system' ? siteMode : picked
  const [systemDark, setSystemDark] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemDark(mq.matches)
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const theme = useMemo(() => {
    const dark = colorMode === 'system' ? systemDark : colorMode === 'dark'
    const base = dark ? darkTheme : lightTheme
    return site ? applySiteTheme(base, site, dark) : base
  }, [colorMode, systemDark, site])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AnimatePresence mode="wait">{children}</AnimatePresence>
    </ThemeProvider>
  )
}
