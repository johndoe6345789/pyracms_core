'use client'

import { useState } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { useSuperAdminTenants } from '@/hooks/useSuperAdminTenants'
import TenantTable from './TenantTable'
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
      <TenantTable tenants={visible} onDelete={handleDelete} />
      <TenantDeleteDialog
        open={confirmDeleteId !== null}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  )
}
