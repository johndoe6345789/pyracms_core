import { Box, Drawer } from '@mui/material'
import type { ReactNode } from 'react'
import { DRAWER_WIDTH } from './AdminDrawerContent'

interface Props {
  isMobile: boolean
  open: boolean
  onClose: () => void
  children: ReactNode
}

export default function AdminSidebar({
  isMobile,
  open,
  onClose,
  children,
}: Props) {
  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        data-testid="admin-drawer-mobile"
      >
        {children}
      </Drawer>
    )
  }
  return (
    <Box component="aside" data-testid="admin-sidebar">
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {children}
      </Drawer>
    </Box>
  )
}
