'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import {
  SECTIONS,
  albumTarget,
  pageTarget,
  tagTarget,
  type MenuTarget,
} from '@/lib/menuTargets'

type Row = Record<string, unknown>

async function articles(tenantId: number): Promise<MenuTarget[]> {
  const out: MenuTarget[] = []
  for (let offset = 0; offset < 300; offset += 100) {
    const res = await api.get(
      `/api/articles?tenant_id=${tenantId}&limit=100&offset=${offset}`,
    )
    const rows: Row[] = Array.isArray(res.data) ? res.data : []
    out.push(
      ...rows.map((a) =>
        pageTarget(String(a.name), String(a.displayName || a.name)),
      ),
    )
    if (rows.length < 100) break
  }
  return out
}

/**
 * Everything a menu link can point at on this site: the stock sections,
 * every article, photo album and tag. Loaded once; a part that fails to
 * load is simply missing (the box still accepts any path or link).
 */
export function useMenuTargets(tenantId: number | null) {
  const [targets, setTargets] = useState<MenuTarget[]>(SECTIONS)

  useEffect(() => {
    if (!tenantId) return
    let live = true
    const q = `tenant_id=${tenantId}`
    Promise.all([
      articles(tenantId).catch(() => []),
      api
        .get(`/api/gallery/albums?${q}`)
        .then((r) =>
          (r.data as Row[]).map((a) =>
            albumTarget(Number(a.id), String(a.displayName || a.name)),
          ),
        )
        .catch(() => []),
      api
        .get(`/api/tags/cloud?${q}`)
        .then((r) =>
          (r.data as Row[]).map((t) =>
            tagTarget(String(t.name), Number(t.count)),
          ),
        )
        .catch(() => []),
    ]).then(([pages, albums, tags]) => {
      if (live) setTargets([...SECTIONS, ...pages, ...albums, ...tags])
    })
    return () => {
      live = false
    }
  }, [tenantId])

  return targets
}
