'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

export interface UserStatsData {
  postCount: number
  threadCount: number
  joinedAt: string
  reputation: number
}

const cache = new Map<string, Promise<UserStatsData | null>>()

export function clearUserStatsCache() {
  cache.clear()
}

function load(userId: number, tenantId: number) {
  const key = `${tenantId}:${userId}`
  let p = cache.get(key)
  if (!p) {
    p = api
      .get(`/api/forum/users/${userId}/stats?tenant_id=${tenantId}`)
      .then((res): UserStatsData => ({
        postCount: Number(res.data?.postCount ?? 0),
        threadCount: Number(res.data?.threadCount ?? 0),
        joinedAt: String(res.data?.joinedAt ?? ''),
        reputation: Number(res.data?.reputation ?? 0),
      }))
      .catch(() => {
        cache.delete(key)
        return null
      })
    cache.set(key, p)
  }
  return p
}

/** A forum author's stats; null while loading or if the call fails. */
export function useUserStats(userId?: number, tenantId?: number | null) {
  const [stats, setStats] = useState<UserStatsData | null>(null)
  useEffect(() => {
    if (!userId || !tenantId) return
    let live = true
    load(userId, tenantId).then((s) => { if (live) setStats(s) })
    return () => { live = false }
  }, [userId, tenantId])
  return stats
}
