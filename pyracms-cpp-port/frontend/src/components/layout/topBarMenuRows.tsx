import { Divider, ListItemIcon, ListSubheader, MenuItem } from '@mui/material'
import Link from 'next/link'
import type { NavEntry } from './navTypes'

const newTab = { target: '_blank', rel: 'noopener noreferrer' } as const

/**
 * The rows of a top-bar dropdown. A child with children of its own becomes a
 * titled group, fenced off by dividers from the links around it. MUI's Menu
 * needs a flat array, so this returns one rather than fragments.
 */
export function menuRows(
  item: NavEntry,
  pathname: string,
  close: () => void,
) {
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
  const kids = item.children ?? []
  return kids.flatMap((c, i) =>
    c.children?.length
      ? [
          ...(i > 0 ? [<Divider key={`${c.key}-top`} />] : []),
          <ListSubheader key={`${c.key}-head`}>{c.label}</ListSubheader>,
          ...c.children.map(row),
          ...(i < kids.length - 1 ? [<Divider key={`${c.key}-end`} />] : []),
        ]
      : [row(c)],
  )
}
