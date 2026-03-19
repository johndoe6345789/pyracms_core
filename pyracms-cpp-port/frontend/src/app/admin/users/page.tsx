'use client'

import { Typography, Box } from '@mui/material'
import { useAdminUsers } from '@/hooks/useAdminUsers'
import UserTable from '@/components/admin/UserTable'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

export default function AdminUsersPage() {
  const {
    users, deleteDialogOpen, selectedUser,
    handleToggleBan, handleDeleteClick, handleDeleteConfirm, handleDeleteCancel,
  } = useAdminUsers()

  return (
    <Box>
      <Typography variant="h3" sx={{ mb: 1 }}>User Management</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View and manage all registered users.
      </Typography>
      <UserTable users={users} onToggleBan={handleToggleBan} onDelete={handleDeleteClick} />
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete User"
        message={`Are you sure you want to delete user "${selectedUser?.username}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Box>
  )
}
