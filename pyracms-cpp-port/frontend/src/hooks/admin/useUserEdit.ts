'use client'

import { useState } from 'react'
import api from '@/lib/api'
import type { UserRow } from './userRow'

export interface UserProfileFields {
  fullName: string
  email: string
}

type SetUsers = React.Dispatch<React.SetStateAction<UserRow[]>>

/**
 * Edit-profile dialog state for the admin user list.
 * The API exposes profile fields only; roles are not editable.
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
    api.put(`/api/users/${id}`, fields)
      .then(() => {
        setUsers((prev) => prev.map((u) =>
          u.id === id ? { ...u, ...fields } : u))
        setEditUser(null)
      })
      .catch((err) => setEditError(
        err?.response?.data?.error || 'Failed to update user'))
      .finally(() => setSaving(false))
  }

  return {
    editUser, saving, editError,
    handleEditClick, handleEditClose, handleEditSave,
  }
}
