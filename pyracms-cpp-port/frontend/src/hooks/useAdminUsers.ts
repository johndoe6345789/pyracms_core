'use client'

import { useState } from 'react'

export interface UserRow {
  id: number
  username: string
  email: string
  created: string
  banned: boolean
}

const PLACEHOLDER_USERS: UserRow[] = [
  { id: 1, username: 'admin', email: 'admin@pyracms.local', created: '2025-01-15', banned: false },
  { id: 2, username: 'johndoe', email: 'john@example.com', created: '2025-02-20', banned: false },
  { id: 3, username: 'janedoe', email: 'jane@example.com', created: '2025-03-10', banned: false },
  { id: 4, username: 'spammer42', email: 'spam@badactor.net', created: '2025-04-01', banned: true },
  { id: 5, username: 'gamer42', email: 'gamer@example.com', created: '2025-04-15', banned: false },
  { id: 6, username: 'techwriter', email: 'tech@example.com', created: '2025-05-01', banned: false },
  { id: 7, username: 'artist01', email: 'artist@example.com', created: '2025-05-20', banned: false },
]

export function useAdminUsers() {
  const [users, setUsers] = useState<UserRow[]>(PLACEHOLDER_USERS)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)

  const handleToggleBan = (id: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, banned: !u.banned } : u))
    )
  }

  const handleDeleteClick = (user: UserRow) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id))
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
    deleteDialogOpen,
    selectedUser,
    handleToggleBan,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
  }
}
