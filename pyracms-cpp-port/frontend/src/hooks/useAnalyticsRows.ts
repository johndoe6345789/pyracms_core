'use client'

import { useEffect, useRef, useState } from 'react'
import api from '@/lib/api'

/**
 * Loads one analytics list for a site and maps it. `path` may carry its
 * own query (e.g. `?period=week`); the site is added. `failed` tells an
 * error apart from "nothing recorded yet".
 */
export function useAnalyticsRows<T>(
  path: string,
  tenantId: number | null | undefined,
  map: (rows: Record<string, unknown>[]) => T[],
) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const mapper = useRef(map)
  mapper.current = map

  useEffect(() => {
    if (!tenantId) return
    let live = true
    setLoading(true)
    const sep = path.includes('?') ? '&' : '?'
    api
      .get(`/api/analytics/${path}${sep}tenant_id=${tenantId}`)
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
  }, [path, tenantId])

  return { rows, loading, failed }
}
