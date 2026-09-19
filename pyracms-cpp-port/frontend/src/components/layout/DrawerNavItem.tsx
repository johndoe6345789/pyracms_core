import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import Link from 'next/link'
import { drawerItemSx } from './drawerStyles'
import type { NavEntry } from './navTypes'

interface Props {
  item: NavEntry
  active: boolean
  onClose: () => void
}

/** One destination row inside the drawer. */
export default function DrawerNavItem({ item, active, onClose }: Props) {
  const testId = item.testId
    ? `drawer-${item.testId}`
    : `drawer-nav-${item.key}`
  return (
    <ListItem disablePadding sx={{ mb: 0.25 }}>
      <ListItemButton
        component={Link}
        href={item.href}
        onClick={onClose}
        selected={active}
        aria-current={active ? 'page' : undefined}
        data-testid={testId}
        sx={drawerItemSx}
      >
        <ListItemIcon
          sx={{
            minWidth: 40,
            color: active ? 'primary.main' : 'text.secondary',
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.label}
          slotProps={{
            primary: { sx: { fontWeight: active ? 700 : 500 } },
          }}
        />
      </ListItemButton>
    </ListItem>
  )
}
