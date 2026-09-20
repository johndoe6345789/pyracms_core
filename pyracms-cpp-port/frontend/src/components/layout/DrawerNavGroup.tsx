'use client'

import { useState } from 'react'
import {
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { ExpandLess, ExpandMore } from '@mui/icons-material'
import DrawerNavItem from './DrawerNavItem'
import { drawerItemSx } from './drawerStyles'
import { isActive, type NavEntry } from './navTypes'

interface Props {
  item: NavEntry
  pathname: string
  onClose: () => void
}

/** A collapsible drawer group (Hypernucleus) with nested links. */
export default function DrawerNavGroup({ item, pathname, onClose }: Props) {
  const active = isActive(pathname, item)
  const [open, setOpen] = useState(active)
  const id = `drawer-group-${item.key}`
  return (
    <>
      <ListItem disablePadding sx={{ mb: 0.25 }}>
        <ListItemButton
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={id}
          data-testid={`drawer-nav-${item.key}`}
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
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit id={id}>
        <List disablePadding sx={{ pl: 2 }}>
          {item.children?.map((c) => (
            <DrawerNavItem
              key={c.key}
              item={c}
              active={isActive(pathname, c)}
              onClose={onClose}
            />
          ))}
        </List>
      </Collapse>
    </>
  )
}
