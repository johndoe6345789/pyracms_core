'use client'

import { Inter } from 'next/font/google'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { lightTheme, darkTheme } from '@/lib/theme'
import StoreProvider from '@/store/StoreProvider'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { useMemo, useEffect, useState } from 'react'
import type { ColorMode } from '@/store/slices/uiSlice'

const inter = Inter({ subsets: ['latin'] })

function ThemeWrapper({ children }: { children: React.ReactNode }) {
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
      {children}
    </ThemeProvider>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
      </head>
      <body className={inter.className}>
        <StoreProvider>
          <ThemeWrapper>
            {children}
          </ThemeWrapper>
        </StoreProvider>
      </body>
    </html>
  )
}
