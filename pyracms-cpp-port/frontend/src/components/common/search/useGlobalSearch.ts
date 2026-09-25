import { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import api from '@/lib/api'
import { useTenantId } from '@/hooks/useTenantId'
import { siteUrl } from '@/lib/searchUrl'
import type { SearchResult } from './searchIcons'

export function useGlobalSearch() {
  const slug = /^\/site\/([^/]+)/.exec(usePathname() ?? '')?.[1] ?? ''
  const { tenantId } = useTenantId(slug)
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [res, setRes] = useState<SearchResult[]>([])
  const t = useRef<ReturnType<typeof setTimeout>>(null)
  const onKey = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setOpen(true)
    }
    if (e.key === 'Escape') setOpen(false)
  }, [])
  useEffect(() => {
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onKey])
  useEffect(() => {
    if (!open) {
      setQ('')
      setRes([])
    }
  }, [open])
  useEffect(() => {
    // Search is per site: without a resolved tenant there is nothing to query
    if (q.length < 2 || !tenantId) {
      setRes([])
      return
    }
    if (t.current) clearTimeout(t.current)
    t.current = setTimeout(() => {
      const u =
        '/api/search/autocomplete?q=' +
        encodeURIComponent(q) +
        `&tenant_id=${tenantId}`
      api
        .get(u)
        .then((r) => {
          const d = r.data.items || r.data || []
          setRes(
            d.map((i: Record<string, unknown>) => ({
              id: String(i.id),
              type: i.type || 'article',
              // the API sends {text, type, url}; older shapes sent title
              title: i.title || i.text || '',
              snippet: i.snippet || '',
              url: siteUrl(slug, String(i.url || '#')),
            })),
          )
        })
        .catch(() => setRes([]))
    }, 300)
  }, [q, tenantId, slug])
  return { open, setOpen, q, setQ, res }
}
