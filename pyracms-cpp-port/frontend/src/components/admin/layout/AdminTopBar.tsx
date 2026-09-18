import Link from 'next/link'
import {
  AppBar, Toolbar, Typography, Box,
  Button, IconButton,
} from '@mui/material'
import {
  MenuOutlined, ArrowBackOutlined,
  AdminPanelSettingsOutlined,
} from '@mui/icons-material'
import NotificationBell
  from '@/components/common/NotificationBell'
import ThemeToggle
  from '@/components/common/ThemeToggle'
import LanguageSelect
  from '@/components/common/LanguageSelect'
import UserBubble
  from '@/components/common/UserBubble'

interface Props {
  slug: string
  isMobile: boolean
  onMenu: () => void
}

export default function AdminTopBar({
  slug,
  isMobile,
  onMenu,
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
      <Toolbar data-testid="admin-toolbar">
        {isMobile && (
          <IconButton
            edge="start"
            sx={{ mr: 1, color: 'text.primary' }}
            onClick={onMenu}
            aria-label="Open admin menu"
            data-testid="admin-menu-toggle"
          >
            <MenuOutlined />
          </IconButton>
        )}
        <AdminPanelSettingsOutlined
          sx={{
            color: 'primary.main',
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
          {slug} Admin
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.5, md: 1 },
          }}
        >
          <LanguageSelect />
          <ThemeToggle />
          <NotificationBell />
          <UserBubble />
          <Button
            component={Link}
            href={`/site/${slug}`}
            startIcon={<ArrowBackOutlined />}
            data-testid="admin-site-link"
            sx={{ color: 'text.secondary', ml: 1 }}
          >
            Site
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
