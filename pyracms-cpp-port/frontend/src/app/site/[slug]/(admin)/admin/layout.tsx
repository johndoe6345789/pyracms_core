'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Box, useMediaQuery, useTheme } from '@mui/material'
import TenantBreadcrumbs
  from '@/components/common/TenantBreadcrumbs'
import SkipLink from '@/components/admin/layout/SkipLink'
import AdminTopBar from '@/components/admin/layout/AdminTopBar'
import AdminSidebar from '@/components/admin/layout/AdminSidebar'
import AdminDrawerContent
  from '@/components/admin/layout/AdminDrawerContent'

export default function TenantAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const slug = useParams().slug as string
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [open, setOpen] = useState(false)

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <SkipLink />
      <AdminSidebar
        isMobile={isMobile}
        open={open}
        onClose={() => setOpen(false)}
      >
        <AdminDrawerContent
          slug={slug}
          onNavigate={() => setOpen(false)}
        />
      </AdminSidebar>
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AdminTopBar
          slug={slug}
          isMobile={isMobile}
          onMenu={() => setOpen(true)}
        />
        <Box
          component="main"
          id="admin-main-content"
          tabIndex={-1}
          data-testid="admin-main-content"
          sx={{ p: { xs: 2, md: 4 }, flexGrow: 1 }}
        >
          <TenantBreadcrumbs />
          {children}
        </Box>
      </Box>
    </Box>
  )
}
