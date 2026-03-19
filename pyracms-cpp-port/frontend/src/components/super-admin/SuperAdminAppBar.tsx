'use client'

import {
  AppBar, Toolbar, Typography,
  Box, IconButton,
} from '@mui/material'
import {
  MenuOutlined, ShieldOutlined,
} from '@mui/icons-material'
import ThemeToggle
  from '@/components/common/ThemeToggle'
import UserBubble
  from '@/components/common/UserBubble'

interface Props {
  isMobile: boolean
  onMenuClick: () => void
}

export default function SuperAdminAppBar({
  isMobile,
  onMenuClick,
}: Props) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar data-testid="super-admin-toolbar">
        {isMobile && (
          <IconButton
            edge="start"
            sx={{ mr: 1, color: 'text.primary' }}
            onClick={onMenuClick}
            aria-label="Open super admin menu"
            data-testid="super-admin-menu-toggle"
          >
            <MenuOutlined />
          </IconButton>
        )}
        <ShieldOutlined
          sx={{
            color: 'warning.main',
            mr: 1,
            fontSize: 22,
          }}
          aria-hidden="true"
        />
        <Typography
          variant="h6"
          sx={{
            color: 'text.primary',
            fontWeight: 700,
            flexGrow: 1,
          }}
        >
          PyraCMS Super Admin
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <ThemeToggle />
          <UserBubble />
        </Box>
      </Toolbar>
    </AppBar>
  )
}
