'use client'

import { useState, useEffect } from 'react'
import { Box, useMediaQuery, useTheme }
  from '@mui/material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { getUserRole, UserRole } from '@/types'
import SuperAdminSidebar
  from '@/components/super-admin/SuperAdminSidebar'
import SuperAdminAppBar
  from '@/components/super-admin/SuperAdminAppBar'
import SuperAdminGuard
  from '@/components/super-admin/SuperAdminGuard'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(
    theme.breakpoints.down('md'),
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  )

  useEffect(() => { setHydrated(true) }, [])

  const allowed = isAuthenticated
    && getUserRole(user) >= UserRole.SuperAdmin

  return (
    <SuperAdminGuard hydrated={hydrated} allowed={allowed}>
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <SuperAdminSidebar
          isMobile={isMobile}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <SuperAdminAppBar
            isMobile={isMobile}
            onMenuClick={() => setDrawerOpen(true)}
          />
          <Box
            component="main"
            id="super-admin-main"
            tabIndex={-1}
            data-testid="super-admin-main-content"
            sx={{
              p: { xs: 2, md: 4 },
              flexGrow: 1,
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </SuperAdminGuard>
  )
}
