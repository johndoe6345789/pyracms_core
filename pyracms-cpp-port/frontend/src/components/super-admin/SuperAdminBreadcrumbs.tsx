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

import { Breadcrumbs, Typography, Box } from '@mui/material'
import { NavigateNextOutlined } from '@mui/icons-material'
import { usePathname } from 'next/navigation'
import { buildCrumbs } from './breadcrumbCrumbs'
import BreadcrumbLink from './BreadcrumbLink'

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
          <BreadcrumbLink key={crumb.href} crumb={crumb} />
        ))}
        {crumbs.length > 0 && crumbs[crumbs.length - 1] && (
          <Typography
            color="text.primary"
            aria-current="page"
            data-testid="breadcrumb-current"
          >
            {crumbs[crumbs.length - 1]?.label}
          </Typography>
        )}
      </Breadcrumbs>
    </Box>
  )
}
