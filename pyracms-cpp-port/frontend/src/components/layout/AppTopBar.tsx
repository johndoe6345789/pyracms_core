'use client'

import { AppBar, Toolbar, Typography } from '@mui/material'
import { LanguageOutlined } from '@mui/icons-material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import MenuToggle from './MenuToggle'
import TopBarLinks from './TopBarLinks'
import TopBarTools from './TopBarTools'
import type { NavEntry } from './navTypes'

interface Props {
  brand: string
  brandHref: string
  /** Inline links shown from the `lg` breakpoint up */
  items: NavEntry[]
  drawerOpen: boolean
  onMenuClick: () => void
  navLabel: string
  /** Where the 'Get the launcher' tool points */
  downloadHref?: string | undefined
}

const barSx = {
  bgcolor: 'background.paper',
  borderBottom: '1px solid',
  borderColor: 'divider',
  backgroundImage: 'none',
} as const

const brandSx = {
  color: 'text.primary',
  textDecoration: 'none',
  fontWeight: 800,
  flexGrow: { xs: 1, lg: 0 },
  mr: { lg: 3 },
  whiteSpace: 'nowrap',
} as const

/**
 * The one top bar used by the portal and by every site. Burger on the
 * left (always), brand, inline links on wide screens, tools on the right.
 */
export default function AppTopBar({
  brand,
  brandHref,
  items,
  drawerOpen,
  onMenuClick,
  navLabel,
  downloadHref,
}: Props) {
  const pathname = usePathname() ?? ''
  return (
    <AppBar position="sticky" elevation={0} sx={barSx}>
      <Toolbar
        component="nav"
        role="navigation"
        aria-label={navLabel}
        data-testid="tenant-appbar"
      >
        <MenuToggle open={drawerOpen} onClick={onMenuClick} />
        <LanguageOutlined
          sx={{ color: 'primary.main', mr: 1, fontSize: 22 }}
          aria-hidden="true"
        />
        <Typography
          variant="h6"
          component={Link}
          href={brandHref}
          data-testid="site-name-link"
          sx={brandSx}
        >
          {brand}
        </Typography>
        <TopBarLinks items={items} pathname={pathname} />
        <TopBarTools {...(downloadHref ? { downloadHref } : {})} />
      </Toolbar>
    </AppBar>
  )
}
