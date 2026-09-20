'use client'

import { useEffect, useRef, useState } from 'react'
import api from '@/lib/api'

/**
 * Loads one analytics list and maps it. `url` is the full API address (null
 * until the site is known). `failed` tells an error apart from "nothing
 * recorded yet".
 */
export function useAnalyticsRows<T>(
  url: string | null,
  map: (rows: Record<string, unknown>[]) => T[],
) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const mapper = useRef(map)
  mapper.current = map

  useEffect(() => {
    if (!url) return
    let live = true
    setLoading(true)
    api
      .get(url)
      .then((r) => {
        if (!live) return
        setRows(mapper.current(Array.isArray(r.data) ? r.data : []))
        setFailed(false)
      })
      .catch(() => live && setFailed(true))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [url])

  return { rows, loading, failed }
}
