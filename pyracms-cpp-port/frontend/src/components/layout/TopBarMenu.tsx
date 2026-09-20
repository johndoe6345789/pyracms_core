'use client'

import { useState } from 'react'
import { Button, Menu } from '@mui/material'
import { ArrowDropDown } from '@mui/icons-material'
import { menuRows } from './topBarMenuRows'
import type { NavEntry } from './navTypes'

interface Props {
  item: NavEntry
  active: boolean
  pathname: string
}

/** A top-bar button that opens a dropdown of the entry's children. */
export default function TopBarMenu({ item, active, pathname }: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const close = () => setAnchor(null)
  const id = `${item.key}-menu`

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
        {menuRows(item, pathname, close)}
      </Menu>
    </>
  )
}
