import { Button } from '@mui/material'
import Link from 'next/link'
import type { NavEntry } from './navTypes'

const newTab = { target: '_blank', rel: 'noopener noreferrer' } as const

/** One plain link of the top row. */
export default function TopBarLinkButton({
  item,
  active,
}: {
  item: NavEntry
  active: boolean
}) {
  return (
    <Button
      component={Link}
      href={item.href}
      startIcon={item.icon}
      data-testid={item.testId ?? `nav-${item.key}`}
      data-fit-key={item.key}
      aria-current={active ? 'page' : undefined}
      {...(item.external ? newTab : {})}
      sx={{
        color: active ? 'primary.main' : 'text.secondary',
        bgcolor: active ? 'action.selected' : 'transparent',
        px: 1.5,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {item.label}
    </Button>
  )
}
