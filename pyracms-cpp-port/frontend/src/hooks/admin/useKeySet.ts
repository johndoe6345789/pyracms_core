'use client'

import { useState } from 'react'
import type { SectionKey } from '@/lib/backup/types'

/** A ticked-off subset of backup sections. */
export function useKeySet(initial: SectionKey[]) {
  const [keys, setKeys] = useState<SectionKey[]>(initial)
  const toggle = (k: SectionKey) =>
    setKeys((cur) =>
      cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k],
    )
  return { keys, setKeys, toggle }
}
