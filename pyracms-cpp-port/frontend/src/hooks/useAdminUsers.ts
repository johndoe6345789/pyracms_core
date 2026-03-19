'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export interface UserRow {
  id: number
  username: string
  email: string
  created: string
  banned: boolean
}

export function useAdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)

  useEffect(() => {
    api.get('/api/users')
      .then(res => {
        const mapped: UserRow[] = (res.data || []).map((u: Record<string, unknown>) => ({
          id: u.id,
          username: u.username || '',
          email: u.email || '',
          created: typeof u.createdAt === 'string' ? (u.createdAt as string).split('T')[0] : '',
          banned: u.banned || false,
        }))
        setUsers(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleToggleBan = (id: number) => {
    const user = users.find(u => u.id === id)
    if (!user) return
    api.put(`/api/users/${id}`, { banned: !user.banned })
      .then(() => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, banned: !u.banned } : u))
      })
      .catch(() => {})
  }

  const handleDeleteClick = (user: UserRow) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id))
    }
    setDeleteDialogOpen(false)
    setSelectedUser(null)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setSelectedUser(null)
  }

  return {
    users,
    loading,
    deleteDialogOpen,
    selectedUser,
    handleToggleBan,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
  }
}
