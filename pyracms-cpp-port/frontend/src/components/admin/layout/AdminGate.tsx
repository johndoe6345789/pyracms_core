'use client'

import type { ReactNode } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { useAdminGate } from '@/hooks/useAdminGate'
import AdminForbidden from './AdminForbidden'

/** Shows `children` only to this site's administrators. */
export default function AdminGate({
  children,
}: {
  children: ReactNode
}) {
  const { slug, allowed, checking } = useAdminGate()
  if (checking) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', py: 12 }}
        data-testid="admin-gate-loading"
      >
        <CircularProgress aria-label="Checking access" />
      </Box>
    )
  }
  return allowed ? <>{children}</> : <AdminForbidden slug={slug} />
}
