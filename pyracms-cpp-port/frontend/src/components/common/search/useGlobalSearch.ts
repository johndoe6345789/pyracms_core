import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useTenantId } from '@/hooks/useTenantId'
import { fetchSuggestions } from '@/lib/search/api'
import type { Suggestion } from '@/lib/search/types'

const DEBOUNCE_MS = 250

/** The quick-search dialog: open with Cmd/Ctrl+K, suggestions as you type. */
export function useGlobalSearch() {
  const slug = /^\/site\/([^/]+)/.exec(usePathname() ?? '')?.[1] ?? ''
  const { tenantId } = useTenantId(slug)
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [res, setRes] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)

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
    // Search is per site: without a resolved tenant there is nothing to ask
    if (q.trim().length < 2 || !tenantId) {
      setRes([])
      setLoading(false)
      return
    }
    let live = true
    setLoading(true)
    const timer = setTimeout(() => {
      fetchSuggestions(slug, tenantId, q.trim())
        .then((r) => live && setRes(r))
        .catch(() => live && setRes([]))
        .finally(() => live && setLoading(false))
    }, DEBOUNCE_MS)
    return () => {
      live = false
      clearTimeout(timer)
    }
  }, [q, tenantId, slug])

  return { open, setOpen, q, setQ, res, loading, slug }
}
