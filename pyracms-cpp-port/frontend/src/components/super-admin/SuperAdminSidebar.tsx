'use client'

import { Box, Drawer } from '@mui/material'
import SuperAdminNav from './SuperAdminNav'

const DRAWER_WIDTH = 260

interface Props {
  isMobile: boolean
  open: boolean
  onClose: () => void
}

export default function SuperAdminSidebar({
  isMobile,
  open,
  onClose,
}: Props) {
  const nav = (
    <SuperAdminNav
      width={DRAWER_WIDTH}
      onNavClick={onClose}
    />
  )

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        data-testid="super-admin-drawer-mobile"
      >
        {nav}
      </Drawer>
    )
  }

  return (
    <Box
      component="aside"
      data-testid="super-admin-sidebar"
    >
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {nav}
      </Drawer>
    </Box>
  )
}
