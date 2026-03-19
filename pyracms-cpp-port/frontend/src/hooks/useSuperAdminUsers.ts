'use client'

import { useState, useEffect } from 'react'
import { UserRole, USER_ROLE_LABELS } from '@/types'
import api from '@/lib/api'

export interface GlobalUserRow {
  id: number
  username: string
  email: string
  role: UserRole
  roleLabel: string
  isActive: boolean
  createdAt: string
}

export function useSuperAdminUsers() {
  const [users, setUsers] = useState<GlobalUserRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/users')
      .then((res) => {
        const mapped: GlobalUserRow[] = (
          res.data || []
        ).map((u: Record<string, unknown>) => {
          const role = u.role !== undefined
            ? Number(u.role) as UserRole
            : u.isAdmin
              ? UserRole.SiteAdmin
              : UserRole.User
          return {
            id: Number(u.id),
            username: String(u.username || ''),
            email: String(u.email || ''),
            role,
            roleLabel: USER_ROLE_LABELS[role],
            isActive: Boolean(u.isActive ?? true),
            createdAt: typeof u.createdAt === 'string'
              ? u.createdAt.split('T')[0]
              : '',
          }
        })
        setUsers(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const updateRole = (id: number, role: UserRole) => {
    api.put(`/api/users/${id}`, { role })
      .then(() => {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === id
              ? {
                  ...u,
                  role,
                  roleLabel: USER_ROLE_LABELS[role],
                }
              : u,
          ),
        )
      })
      .catch(() => {})
  }

  return { users, loading, updateRole }
}
