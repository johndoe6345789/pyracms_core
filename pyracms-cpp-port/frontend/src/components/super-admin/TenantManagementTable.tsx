'use client'

import {
  Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
  Paper, Typography, Box, CircularProgress,
} from '@mui/material'
import {
  useSuperAdminTenants,
} from '@/hooks/useSuperAdminTenants'
import TenantTableRow from './TenantTableRow'
import TenantDeleteDialog from './TenantDeleteDialog'

export default function TenantManagementTable() {
  const {
    tenants, loading, confirmDeleteId,
    handleDelete, confirmDelete, cancelDelete,
  } = useSuperAdminTenants()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', pt: 4 }}>
        <CircularProgress
          aria-label="Loading tenants"
        />
      </Box>
    )
  }

  return (
    <>
      <TableContainer
        component={Paper}
        variant="outlined"
        data-testid="tenant-management-table"
      >
        <Table aria-label="Tenant management table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary">
                    No tenants found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {tenants.map((t) => (
              <TenantTableRow
                key={t.id}
                tenant={t}
                onDelete={handleDelete}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TenantDeleteDialog
        open={confirmDeleteId !== null}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  )
}
