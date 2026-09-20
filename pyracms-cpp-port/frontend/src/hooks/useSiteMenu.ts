'use client'

import { useEffect, useState } from 'react'
import { fetchMenuGroups, type MenuItemRow } from '@/hooks/admin/menuData'
import { useTenantId } from '@/hooks/useTenantId'

const TTL_MS = 15_000
const cache = new Map<number, { items: MenuItemRow[]; at: number }>()

/** Forget the cached menus, e.g. after the owner edited them. */
export function invalidateSiteMenu() {
  cache.clear()
}

/**
 * The group shown along the top of a site: the one named `main`, else the
 * first group that has links.
 */
export function pickTopGroup<T extends { name: string; items: unknown[] }>(
  groups: T[],
): T | undefined {
  return (
    groups.find((g) => g.name.trim().toLowerCase() === 'main') ??
    groups.find((g) => g.items.length > 0)
  )
}

/** The site owner's configured top-row links (empty until loaded). */
export function useSiteMenu(slug: string) {
  const { tenantId } = useTenantId(slug)
  const hit = tenantId ? cache.get(tenantId) : undefined
  const [items, setItems] = useState<MenuItemRow[]>(hit?.items ?? [])

  useEffect(() => {
    if (!tenantId) return
    const fresh = cache.get(tenantId)
    if (fresh && Date.now() - fresh.at < TTL_MS) {
      setItems(fresh.items)
      return
    }
    let live = true
    fetchMenuGroups(tenantId)
      .then((groups) => {
        const mine = pickTopGroup(groups)?.items ?? []
        cache.set(tenantId, { items: mine, at: Date.now() })
        if (live) setItems(mine)
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [tenantId])

  return { items }
}
