'use client'

import { Box, Typography, Button } from '@mui/material'
import { AddCircleOutline } from '@mui/icons-material'
import Link from 'next/link'
import TenantManagementTable
  from '@/components/super-admin/TenantManagementTable'

export default function SuperAdminTenantsPage() {
  return (
    <Box data-testid="super-admin-tenants-page">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 700 }}
        >
          Tenants
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleOutline />}
          component={Link}
          href="/create-site"
          data-testid="new-tenant-button"
          aria-label="Create new site"
        >
          New Site
        </Button>
      </Box>
      <TenantManagementTable />
    </Box>
  )
}
