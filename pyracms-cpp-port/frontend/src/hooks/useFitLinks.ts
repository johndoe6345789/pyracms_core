'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { fitCount } from '@/lib/fitCount'

const MORE_WIDTH = 96
const GAP = 4

/**
 * Keeps as many links in a row as fit its width and reports how many.
 * `signature` names the links (their keys joined by `|`); each rendered
 * link carries `data-fit-key`. Widths are remembered so a row that grows
 * again can bring hidden links back. A row that is not displayed (width 0,
 * below the breakpoint) is not measured.
 */
export function useFitLinks(signature: string) {
  const ref = useRef<HTMLDivElement>(null)
  const widths = useRef(new Map<string, number>())
  const [count, setCount] = useState(signature.split('|').length)

  useLayoutEffect(() => {
    widths.current.clear()
    setCount(signature.split('|').length)
  }, [signature])

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const keys = signature.split('|')
    const measure = () => {
      if (el.clientWidth === 0) return
      el.querySelectorAll<HTMLElement>('[data-fit-key]').forEach((n) => {
        widths.current.set(n.dataset.fitKey ?? '', n.offsetWidth + GAP)
      })
      if (!keys.every((k) => widths.current.has(k))) return
      const all = keys.map((k) => widths.current.get(k) ?? 0)
      setCount(fitCount(all, el.clientWidth, MORE_WIDTH))
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [signature, count])

  return { ref, count }
}
