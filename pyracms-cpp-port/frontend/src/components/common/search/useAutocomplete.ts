import { useState, useRef, useCallback } from 'react'
import api from '@/lib/api'

export interface Result {
  text: string
  type: string
  url: string
}

export function useAutocomplete(tenantId?: number | null) {
  const [q, setQ] = useState('')
  const [res, setRes] = useState<Result[]>([])
  const [open, setOpen] = useState(false)
  const tm = useRef<NodeJS.Timeout>(null)
  const chg = useCallback(
    (v: string) => {
      setQ(v)
      if (tm.current) clearTimeout(tm.current)
      if (v.length < 2 || !tenantId) {
        setRes([])
        setOpen(false)
        return
      }
      tm.current = setTimeout(async () => {
        try {
          const u =
            '/api/search/autocomplete?q=' +
            encodeURIComponent(v) +
            `&tenant_id=${tenantId}&limit=8`
          const r = await api.get(u)
          setRes(r.data || [])
          setOpen((r.data || []).length > 0)
        } catch {
          setRes([])
          setOpen(false)
        }
      }, 200)
    },
    [tenantId],
  )
  return { q, setQ, res, open, setOpen, chg }
}
