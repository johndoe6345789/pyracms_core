'use client'

import { useCallback, useEffect, useState } from 'react'
import api from '@/lib/api'
import {
  ALL_ON,
  flagsFromSettings,
  isFeatureOn,
  type FeatureFlags,
  type FeatureId,
} from '@/lib/siteFeatures'
import { useTenantId } from './useTenantId'

const TTL_MS = 30_000
const cache = new Map<number, { flags: FeatureFlags; at: number }>()
const listeners = new Set<() => void>()

/** Stores fresh flags for a site and tells every mounted menu/guard. */
export function publishSiteFeatures(tenantId: number, flags: FeatureFlags) {
  cache.set(tenantId, { flags, at: Date.now() })
  listeners.forEach((l) => l())
}

export function clearSiteFeaturesCache() {
  cache.clear()
}

const fresh = (tenantId: number | null): FeatureFlags | null => {
  const hit = tenantId ? cache.get(tenantId) : undefined
  return hit && Date.now() - hit.at < TTL_MS ? hit.flags : null
}

/**
 * Which features a site has switched on. `flags` is null until loaded;
 * `isOn` is optimistic meanwhile (and when the lookup fails).
 */
export function useSiteFeatures(slug: string) {
  const { tenantId } = useTenantId(slug)
  const [flags, setFlags] = useState<FeatureFlags | null>(fresh(tenantId))

  useEffect(() => {
    const sync = () => setFlags(fresh(tenantId))
    listeners.add(sync)
    return () => {
      listeners.delete(sync)
    }
  }, [tenantId])

  useEffect(() => {
    if (!tenantId) return
    const hit = fresh(tenantId)
    if (hit) return setFlags(hit)
    let live = true
    api
      .get(`/api/settings?tenant_id=${tenantId}`)
      .then((res) => flagsFromSettings(res.data || []))
      .catch(() => ALL_ON)
      .then((f) => {
        if (!live) return
        cache.set(tenantId, { flags: f, at: Date.now() })
        setFlags(f)
      })
    return () => {
      live = false
    }
  }, [tenantId])

  const isOn = useCallback(
    (id: FeatureId | undefined) => isFeatureOn(flags, id),
    [flags],
  )
  return { flags, loading: flags === null, isOn }
}
