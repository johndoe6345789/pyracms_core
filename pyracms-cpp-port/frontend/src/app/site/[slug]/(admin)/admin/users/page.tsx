'use client'

import { Typography, Box, Button } from '@mui/material'
import { PersonAddOutlined } from '@mui/icons-material'
import { useAdminUsers } from '@/hooks/useAdminUsers'
import UserTable from '@/components/admin/UserTable'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import CreateUserDialog from
  '@/components/admin/users/CreateUserDialog'
import { useCreateUser } from
  '@/components/admin/users/useCreateUser'

export default function AdminUsersPage() {
  const {
    users,
    deleteDialogOpen,
    selectedUser,
    handleToggleBan,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useAdminUsers()
  const create = useCreateUser()

  return (
    <Box data-testid="admin-users-page">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h3" sx={{ mb: 1 }}>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage all registered users.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddOutlined />}
          onClick={() => create.setOpen(true)}
          data-testid="create-user-btn"
        >
          Create User
        </Button>
      </Box>
      <UserTable
        users={users}
        onToggleBan={handleToggleBan}
        onDelete={handleDeleteClick}
      />
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete User"
        message={
          'Are you sure you want to delete' +
          ` user "${selectedUser?.username}"?` +
          ' This action cannot be undone.'
        }
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
      <CreateUserDialog s={create} />
    </Box>
  )
}
