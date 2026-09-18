import { useState, useEffect, useCallback, useRef } from 'react'
import api from '@/lib/api'
import type { SearchResult } from './searchIcons'

export function useGlobalSearch() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [res, setRes] = useState<SearchResult[]>([])
  const t = useRef<ReturnType<typeof setTimeout>>(null)
  const onKey = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault(); setOpen(true)
    }
    if (e.key === 'Escape') setOpen(false)
  }, [])
  useEffect(() => {
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onKey])
  useEffect(() => {
    if (!open) { setQ(''); setRes([]) }
  }, [open])
  useEffect(() => {
    if (q.length < 2) { setRes([]); return }
    if (t.current) clearTimeout(t.current)
    t.current = setTimeout(() => {
      const m = window.location.pathname.match(/\/site\/([^/]+)/)
      const tp = m ? '&tenant_id=1' : ''
      const u = '/api/search/autocomplete?q=' + encodeURIComponent(q) + tp
      api.get(u).then(r => {
        const d = r.data.items || r.data || []
        setRes(d.map((i: Record<string, unknown>) => ({
          id: String(i.id),
          type: i.type || 'article',
          title: i.title || '',
          snippet: i.snippet || '',
          url: i.url || '#',
        })))
      }).catch(() => setRes([]))
    }, 300)
  }, [q])
  return { open, setOpen, q, setQ, res }
}
