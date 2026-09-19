'use client'

import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material'
import { LogoutOutlined } from '@mui/icons-material'
import type { RootState } from '@/store/store'
import UserMenuHeader from './UserMenuHeader'

interface Props {
  anchor: HTMLElement | null
  user: RootState['auth']['user']
  links: React.ReactNode
  onClose: () => void
  onLogout: () => void
}

export default function UserBubbleMenu(p: Props) {
  return (
    <Menu
      anchorEl={p.anchor}
      open={Boolean(p.anchor)}
      onClose={p.onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{ paper: { sx: { minWidth: 220, mt: 1 } } }}
    >
      <UserMenuHeader user={p.user} />
      <Divider />
      {p.links}
      <Divider />
      <MenuItem onClick={p.onLogout} data-testid="logout-btn">
        <ListItemIcon>
          <LogoutOutlined fontSize="small" />
        </ListItemIcon>
        <ListItemText>Sign Out</ListItemText>
      </MenuItem>
    </Menu>
  )
}
