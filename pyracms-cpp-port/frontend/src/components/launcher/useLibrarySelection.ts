'use client'

import { useEffect, useState } from 'react'
import type { GameDepItem } from '@/hooks/useGameDepList'
import type { LibraryView } from './LibraryHeader'

/** Selected game, active view and drawer state of the library shell. */
export function useLibrarySelection(
  visible: GameDepItem[],
  initialName: string | undefined,
) {
  const [view, setView] = useState<LibraryView>(
    initialName ? 'library' : 'browse',
  )
  const [selected, setSelected] = useState(initialName ?? null)
  const [drawer, setDrawer] = useState(false)

  useEffect(() => {
    if (!selected && view === 'library' && visible[0])
      setSelected(visible[0].name)
  }, [selected, view, visible])

  const select = (name: string) => {
    setSelected(name)
    setView('library')
    setDrawer(false)
  }
  return { view, setView, selected, drawer, setDrawer, select }
}
