'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material'
import { useSuperAdminTenants } from '@/hooks/useSuperAdminTenants'
import TenantTableRow from './TenantTableRow'
import TenantDeleteDialog from './TenantDeleteDialog'
import TenantFilter from './TenantFilter'
import { ErrorAlert } from '../common/ErrorAlert'

export default function TenantManagementTable() {
  const {
    tenants,
    loading,
    confirmDeleteId,
    handleDelete,
    confirmDelete,
    cancelDelete,
    deleteError,
  } = useSuperAdminTenants()

  const [filter, setFilter] = useState('')

  if (loading) {
    return (
      <Box sx={{ display: 'flex', pt: 4 }}>
        <CircularProgress aria-label="Loading tenants" />
      </Box>
    )
  }

  const lc = filter.toLowerCase()
  const visible = filter
    ? tenants.filter((t) => t.name.toLowerCase().includes(lc))
    : tenants

  return (
    <>
      <ErrorAlert error={deleteError} testId="tenant-delete-error" />
      <TenantFilter value={filter} onChange={setFilter} />
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
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary">
                    No tenants found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {visible.map((t) => (
              <TenantTableRow key={t.id} tenant={t} onDelete={handleDelete} />
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
