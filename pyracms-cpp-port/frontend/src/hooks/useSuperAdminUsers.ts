'use client'

import { useState, useEffect } from 'react'
import { UserRole, USER_ROLE_LABELS } from '@/types'
import api from '@/lib/api'
import { mapUserRow, type GlobalUserRow } from './superAdminRows'
import { useActionError } from './useActionError'

export type { GlobalUserRow }

export function useSuperAdminUsers() {
  const [users, setUsers] = useState<GlobalUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const { error, setError, fail } = useActionError()

  useEffect(() => {
    api.get('/api/users')
      .then((res) => setUsers((res.data || []).map(mapUserRow)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const updateRole = (id: number, role: UserRole) => {
    setError('')
    api.put(`/api/users/${id}`, { role })
      .then(() => {
        setUsers((prev) => prev.map((u) => u.id === id
          ? { ...u, role, roleLabel: USER_ROLE_LABELS[role] } : u))
      })
      .catch(fail('Could not update role'))
  }

  const toggleBan = (id: number) => {
    const target = users.find((u) => u.id === id)
    if (!target) return
    const isActive = !target.isActive
    // Side effect stays out of the state updater (it may run twice).
    const set = (active: boolean) => setUsers((prev) => prev.map((u) =>
      u.id === id ? { ...u, isActive: active } : u))
    set(isActive)
    setError('')
    api.put(`/api/users/${id}/ban`, { banned: !isActive })
      .catch((e) => {
        set(!isActive) // roll back when the API refuses
        fail('Could not update user status')(e)
      })
  }

  return { users, loading, error, updateRole, toggleBan }
}
