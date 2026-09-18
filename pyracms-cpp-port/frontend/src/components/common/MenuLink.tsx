import { MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import Link from 'next/link'

interface Props {
  href: string
  label: string
  testId: string
  icon: React.ReactNode
  onClick: () => void
}

/** A link row inside the user menu. */
export default function MenuLink(p: Props) {
  return (
    <MenuItem
      component={Link}
      href={p.href}
      onClick={p.onClick}
      data-testid={p.testId}
    >
      <ListItemIcon>{p.icon}</ListItemIcon>
      <ListItemText>{p.label}</ListItemText>
    </MenuItem>
  )
}
