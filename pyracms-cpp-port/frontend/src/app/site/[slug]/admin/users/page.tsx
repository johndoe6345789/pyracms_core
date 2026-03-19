'use client'

import { useState } from 'react'
import {
  Typography, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert,
} from '@mui/material'
import { PersonAddOutlined } from '@mui/icons-material'
import { useAdminUsers } from '@/hooks/useAdminUsers'
import UserTable from '@/components/admin/UserTable'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import api from '@/lib/api'

export default function AdminUsersPage() {
  const {
    users, deleteDialogOpen, selectedUser,
    handleToggleBan, handleDeleteClick, handleDeleteConfirm, handleDeleteCancel,
  } = useAdminUsers()

  const [createOpen, setCreateOpen] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newFullName, setNewFullName] = useState('')
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreateUser = () => {
    if (!newUsername.trim() || !newEmail.trim() || !newPassword.trim()) return
    setCreating(true)
    setCreateError('')
    api.post('/api/auth/register', {
      username: newUsername.trim(),
      email: newEmail.trim(),
      password: newPassword,
      fullName: newFullName.trim(),
    })
      .then(() => {
        setCreateOpen(false)
        setNewUsername('')
        setNewEmail('')
        setNewPassword('')
        setNewFullName('')
        window.location.reload()
      })
      .catch(err => {
        const msg = err?.response?.data?.error || 'Failed to create user'
        setCreateError(msg)
      })
      .finally(() => setCreating(false))
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ mb: 1 }}>User Management</Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage all registered users.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<PersonAddOutlined />} onClick={() => setCreateOpen(true)}>
          Create User
        </Button>
      </Box>
      <UserTable users={users} onToggleBan={handleToggleBan} onDelete={handleDeleteClick} />
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete User"
        message={`Are you sure you want to delete user "${selectedUser?.username}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create User</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {createError && <Alert severity="error">{createError}</Alert>}
          <TextField label="Username" value={newUsername} onChange={e => setNewUsername(e.target.value)} required size="small" />
          <TextField label="Email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required size="small" />
          <TextField label="Full Name" value={newFullName} onChange={e => setNewFullName(e.target.value)} size="small" />
          <TextField label="Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required size="small" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateUser} disabled={creating || !newUsername.trim() || !newEmail.trim() || !newPassword.trim()}>
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
