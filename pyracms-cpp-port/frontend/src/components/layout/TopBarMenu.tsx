'use client'

import { useState } from 'react'
import {
  Button,
  Divider,
  ListItemIcon,
  ListSubheader,
  Menu,
  MenuItem,
} from '@mui/material'
import { ArrowDropDown } from '@mui/icons-material'
import Link from 'next/link'
import type { NavEntry } from './navTypes'

interface Props {
  item: NavEntry
  active: boolean
  pathname: string
}

const newTab = { target: '_blank', rel: 'noopener noreferrer' } as const

/** A top-bar button that opens a dropdown of the entry's children. */
export default function TopBarMenu({ item, active, pathname }: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const close = () => setAnchor(null)
  const id = `${item.key}-menu`

  const row = (c: NavEntry) => (
    <MenuItem
      key={c.key}
      component={Link}
      href={c.href}
      onClick={close}
      selected={pathname === c.href}
      data-testid={`nav-${c.key}`}
      {...(c.external ? newTab : {})}
    >
      {c.icon && <ListItemIcon>{c.icon}</ListItemIcon>}
      {c.label}
    </MenuItem>
  )
  // A child that has children of its own becomes a titled group
  // and is fenced off by dividers from the links around it
  const kids = item.children ?? []
  const rows = kids.flatMap((c, i) =>
    c.children?.length
      ? [
          ...(i > 0 ? [<Divider key={`${c.key}-top`} />] : []),
          <ListSubheader key={`${c.key}-head`}>{c.label}</ListSubheader>,
          ...c.children.map(row),
          ...(i < kids.length - 1 ? [<Divider key={`${c.key}-end`} />] : []),
        ]
      : [row(c)],
  )

  return (
    <>
      <Button
        startIcon={item.icon}
        endIcon={<ArrowDropDown />}
        onClick={(e) => setAnchor(e.currentTarget)}
        data-testid={item.testId ?? `nav-${item.key}`}
        data-fit-key={item.key}
        aria-haspopup="menu"
        aria-expanded={anchor ? 'true' : undefined}
        aria-controls={anchor ? id : undefined}
        sx={{
          color: active ? 'primary.main' : 'text.secondary',
          bgcolor: active ? 'action.selected' : 'transparent',
          px: 1.5,
          whiteSpace: 'nowrap',
        }}
      >
        {item.label}
      </Button>
      <Menu id={id} anchorEl={anchor} open={!!anchor} onClose={close}>
        {rows}
      </Menu>
    </>
  )
}
