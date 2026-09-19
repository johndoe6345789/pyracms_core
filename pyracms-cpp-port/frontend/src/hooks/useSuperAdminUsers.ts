'use client'

import { useState, useEffect } from 'react'
import { UserRole, USER_ROLE_LABELS } from '@/types'
import api from '@/lib/api'
import { mapUserRow, type GlobalUserRow } from './superAdminRows'

export type { GlobalUserRow }

export function useSuperAdminUsers() {
  const [users, setUsers] = useState<GlobalUserRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/users')
      .then((res) => setUsers((res.data || []).map(mapUserRow)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const updateRole = (id: number, role: UserRole) => {
    api.put(`/api/users/${id}`, { role })
      .then(() => {
        setUsers((prev) => prev.map((u) => u.id === id
          ? { ...u, role, roleLabel: USER_ROLE_LABELS[role] } : u))
      })
      .catch(() => {})
  }

  const toggleBan = (id: number) => {
    const target = users.find((u) => u.id === id)
    if (!target) return
    const isActive = !target.isActive
    // Side effect stays out of the state updater (it may run twice).
    api.put(`/api/users/${id}`, { isActive }).catch(() => {})
    setUsers((prev) => prev.map((u) =>
      u.id === id ? { ...u, isActive } : u))
  }

  return { users, loading, updateRole, toggleBan }
}
