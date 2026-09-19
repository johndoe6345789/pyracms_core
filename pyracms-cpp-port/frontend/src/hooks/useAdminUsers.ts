'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { mapUser, type UserRow } from './admin/userRow'
import { useUserEdit } from './admin/useUserEdit'

export type { UserRow }

export function useAdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] =
    useState<UserRow | null>(null)
  const edit = useUserEdit(setUsers)

  useEffect(() => {
    api.get('/api/users')
      .then(res => setUsers((res.data || []).map(mapUser)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleToggleBan = (id: number) => {
    const user = users.find(u => u.id === id)
    if (!user) return
    api.put(`/api/users/${id}`, { banned: !user.banned })
      .then(() => {
        setUsers(prev => prev.map(u =>
          u.id === id ? { ...u, banned: !u.banned } : u))
      })
      .catch(() => {})
  }

  const handleDeleteClick = (user: UserRow) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setSelectedUser(null)
  }

  const handleDeleteConfirm = () => {
    const target = selectedUser
    handleDeleteCancel()
    if (!target) return
    api.delete(`/api/users/${target.id}`)
      .then(() => {
        setUsers(prev => prev.filter(u => u.id !== target.id))
      })
      .catch(() => {})
  }

  return {
    users, loading, deleteDialogOpen, selectedUser,
    handleToggleBan, handleDeleteClick,
    handleDeleteConfirm, handleDeleteCancel, ...edit,
  }
}
