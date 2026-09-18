import { useState, useEffect } from 'react'
import api from '@/lib/api'
import type { UserProfile } from './UserHeader'

export function useUserProfile(username: string) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/api/users?username=${username}`)
        const d = Array.isArray(res.data) ? res.data[0] : res.data
        if (d) {
          setUser({
            id: d.id,
            username: d.username,
            email: d.email || '',
            bio: d.bio || '',
            location: d.location || '',
            avatarUrl: d.avatarUrl || d.avatar_url || '',
            reputation: d.reputation || 0,
            createdAt: d.createdAt || d.created_at || '',
          })
        }
      } catch { /* ignore */ }
      setLoading(false)
    }
    fetchUser()
  }, [username])

  return { user, loading }
}
