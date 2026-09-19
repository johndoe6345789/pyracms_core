import { useState, useEffect } from 'react'
import api from '@/lib/api'
import type { UserProfile } from './UserHeader'

type Row = Record<string, unknown>
const str = (v: unknown) => (typeof v === 'string' ? v : '')
const num = (v: unknown) => (typeof v === 'number' ? v : 0)
const opt = (url: string): Promise<Row> =>
  api
    .get(url)
    .then((r) => (r.data ?? {}) as Row)
    .catch(() => ({}))

/** Merge the list row, the full user record and the reputation totals. */
export function mapProfile(d: Row, det: Row, rep: Row): UserProfile {
  return {
    id: num(d.id),
    username: str(d.username),
    email: str(d.email),
    bio: str(det.aboutme),
    website: str(det.website),
    avatarUrl: str(d.avatarUrl),
    reputation: num(rep.total),
    postCount: num(rep.postCount),
    createdAt: str(d.createdAt),
  }
}

export function useUserProfile(username: string) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(
          `/api/users?username=${encodeURIComponent(username)}`,
        )
        const d: Row | undefined = Array.isArray(res.data)
          ? res.data[0]
          : undefined
        if (d) {
          const [det, rep] = await Promise.all([
            opt(`/api/users/${num(d.id)}`),
            opt(`/api/users/${num(d.id)}/reputation`),
          ])
          setUser(mapProfile(d, det, rep))
        }
      } catch {
        /* ignore */
      }
      setLoading(false)
    }
    fetchUser()
  }, [username])

  return { user, loading }
}
