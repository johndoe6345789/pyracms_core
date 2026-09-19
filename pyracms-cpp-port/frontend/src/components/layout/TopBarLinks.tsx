import { Box, Button } from '@mui/material'
import Link from 'next/link'
import { isActive, type NavEntry } from './navTypes'

/** Inline links shown from the `lg` breakpoint up. */
export default function TopBarLinks({
  items,
  pathname,
}: {
  items: NavEntry[]
  pathname: string
}) {
  return (
    <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 0.5, flexGrow: 1 }}>
      {items.map((item) => {
        const active = isActive(pathname, item)
        return (
          <Button
            key={item.key}
            component={Link}
            href={item.href}
            startIcon={item.icon}
            data-testid={item.testId ?? `nav-${item.key}`}
            aria-current={active ? 'page' : undefined}
            sx={{
              color: active ? 'primary.main' : 'text.secondary',
              bgcolor: active ? 'action.selected' : 'transparent',
              px: 1.5,
            }}
          >
            {item.label}
          </Button>
        )
      })}
    </Box>
  )
}
