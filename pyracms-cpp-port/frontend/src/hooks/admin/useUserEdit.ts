'use client'

import { useState } from 'react'
import api from '@/lib/api'
import type { UserRow } from './userRow'
import { apiError } from './apiError'

export interface UserProfileFields {
  fullName: string
  email: string
  role: number
}

type SetUsers = React.Dispatch<React.SetStateAction<UserRow[]>>

/**
 * Edit-profile dialog state for the admin user list.
 * Name and email always go along; the role only when it changed.
 * @param setUsers - State setter for the user list.
 */
export function useUserEdit(setUsers: SetUsers) {
  const [editUser, setEditUser] = useState<UserRow | null>(null)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const handleEditClick = (user: UserRow) => {
    setEditError('')
    setEditUser(user)
  }

  const handleEditClose = () => setEditUser(null)

  const handleEditSave = (fields: UserProfileFields) => {
    if (!editUser) return
    const id = editUser.id
    setSaving(true)
    setEditError('')
    const { role, ...profile } = fields
    const body = role === editUser.role ? profile : fields
    api
      .put(`/api/users/${id}`, body)
      .then(() => {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, ...fields } : u)),
        )
        setEditUser(null)
      })
      .catch((err) => setEditError(apiError(err, 'Failed to update user')))
      .finally(() => setSaving(false))
  }

  return {
    editUser,
    saving,
    editError,
    handleEditClick,
    handleEditClose,
    handleEditSave,
  }
}
