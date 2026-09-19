import { AppBar, Toolbar, Typography, IconButton } from '@mui/material'
import { MenuOutlined, AdminPanelSettingsOutlined } from '@mui/icons-material'
import AdminTopBarActions from './AdminTopBarActions'

interface Props {
  slug: string
  isMobile: boolean
  onMenu: () => void
}

export default function AdminTopBar({ slug, isMobile, onMenu }: Props) {
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
        <AdminTopBarActions slug={slug} />
      </Toolbar>
    </AppBar>
  )
}
