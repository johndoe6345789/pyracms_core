'use client'

/**
 * SuperAdminBreadcrumbs
 *
 * Renders a MUI Breadcrumbs trail for the super-admin layout.
 * Each segment is derived from the current pathname:
 *
 *   /super-admin            → "Super Admin"  (non-link, current page)
 *   /super-admin/tenants    → "Super Admin" › "Tenants"
 *   /super-admin/tenants/42 → "Super Admin" › "Tenants" › "42"
 *
 * The last segment is always a plain Typography (current page);
 * all preceding segments are clickable Links.
 */

import {
  Breadcrumbs,
  Link as MuiLink,
  Typography,
  Box,
} from '@mui/material'
import {
  NavigateNextOutlined,
  ShieldOutlined,
} from '@mui/icons-material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

/** Maps raw path slugs to human-readable labels. */
const SEGMENT_LABELS: Record<string, string> = {
  'super-admin': 'Super Admin',
  tenants: 'Tenants',
  users: 'Users',
  settings: 'Settings',
}

/** Capitalise first letter, fall back to the raw slug. */
function labelFor(segment: string): string {
  return SEGMENT_LABELS[segment]
    ?? segment.charAt(0).toUpperCase() + segment.slice(1)
}

interface Crumb {
  label: string
  href: string
}

/** Build ordered crumbs from a pathname string. */
function buildCrumbs(pathname: string): Crumb[] {
  const parts = pathname.split('/').filter(Boolean)
  return parts.map((segment, idx) => ({
    label: labelFor(segment),
    href: '/' + parts.slice(0, idx + 1).join('/'),
  }))
}

export default function SuperAdminBreadcrumbs() {
  const pathname = usePathname() ?? '/super-admin'
  const crumbs = buildCrumbs(pathname)

  return (
    <Box
      sx={{ px: { xs: 2, md: 4 }, py: 1.5 }}
      data-testid="super-admin-breadcrumbs"
    >
      <Breadcrumbs
        aria-label="Super admin breadcrumb navigation"
        separator={
          <NavigateNextOutlined
            fontSize="small"
            aria-hidden="true"
          />
        }
      >
        {crumbs.slice(0, -1).map((crumb) => (
          <MuiLink
            key={crumb.href}
            component={Link}
            href={crumb.href}
            underline="hover"
            color="inherit"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
            data-testid={
              `breadcrumb-link-${crumb.label
                .toLowerCase()
                .replace(/\s+/g, '-')}`
            }
          >
            {crumb.href === '/super-admin' && (
              <ShieldOutlined
                sx={{ fontSize: 14 }}
                aria-hidden="true"
              />
            )}
            {crumb.label}
          </MuiLink>
        ))}
        {crumbs.length > 0 && (
          <Typography
            color="text.primary"
            aria-current="page"
            data-testid="breadcrumb-current"
          >
            {crumbs[crumbs.length - 1].label}
          </Typography>
        )}
      </Breadcrumbs>
    </Box>
  )
}
