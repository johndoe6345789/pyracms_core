import { useState, useEffect } from 'react'
import api from '@/lib/api'
import type { ActivityEvent } from './ActivityItem'

export function useUserActivity(
  userId: number | undefined, skip: boolean,
) {
  const [acts, setActs] = useState<ActivityEvent[]>([])
  useEffect(() => {
    if (skip || !userId) return
    ;(async () => {
      try {
        const res = await api.get(
          `/api/users/${userId}/activity?limit=50`)
        setActs((res.data || []).map(
          (r: Record<string, unknown>) => ({
            id: String(r.id),
            type: r.type as string,
            title: r.title as string,
            description: (r.summary as string) || '',
            date: r.createdAt as string,
          })))
      } catch { /* ignore */ }
    })()
  }, [userId, skip])
  return acts
}
