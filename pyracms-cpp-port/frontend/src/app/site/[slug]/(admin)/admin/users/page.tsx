'use client'

import { Alert, Box } from '@mui/material'
import { useAdminUsers } from '@/hooks/useAdminUsers'
import { useActor } from '@/hooks/useActor'
import UserTable from '@/components/admin/UserTable'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import CreateUserDialog from '@/components/admin/users/CreateUserDialog'
import EditUserDialog from '@/components/admin/users/EditUserDialog'
import UsersHeader from '@/components/admin/users/UsersHeader'
import { useCreateUser } from '@/components/admin/users/useCreateUser'

export default function AdminUsersPage() {
  const u = useAdminUsers()
  const create = useCreateUser()
  const actor = useActor(u.users)

  return (
    <Box data-testid="admin-users-page">
      <UsersHeader onCreate={() => create.setOpen(true)} />
      {u.actionError && (
        <Alert severity="error" sx={{ mb: 2 }} data-testid="users-action-error">
          {u.actionError}
        </Alert>
      )}
      <UserTable
        users={u.users}
        onToggleBan={u.handleToggleBan}
        onDelete={u.handleDeleteClick}
        onEdit={u.handleEditClick}
        actor={actor}
      />
      <ConfirmDialog
        open={u.deleteDialogOpen}
        title="Delete User"
        message={
          'Are you sure you want to delete' +
          ` user "${u.selectedUser?.username}"?` +
          ' This action cannot be undone.'
        }
        onConfirm={u.handleDeleteConfirm}
        onCancel={u.handleDeleteCancel}
      />
      <EditUserDialog
        user={u.editUser}
        saving={u.saving}
        error={u.editError}
        onClose={u.handleEditClose}
        onSave={u.handleEditSave}
        actor={actor}
      />
      <CreateUserDialog s={create} />
    </Box>
  )
}
