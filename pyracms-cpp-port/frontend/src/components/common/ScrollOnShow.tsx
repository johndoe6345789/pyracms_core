'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { Box } from '@mui/material'

/** Brings its content into view when it appears or `trigger` changes (so a
 * run's output isn't left below the fold). */
export function ScrollOnShow({
  trigger,
  children,
}: {
  trigger: unknown
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' })
  }, [trigger])
  return (
    <Box ref={ref} sx={{ scrollMarginBottom: 24 }} data-testid="scroll-target">
      {children}
    </Box>
  )
}
