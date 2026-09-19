'use client'

import { Link as MuiLink } from '@mui/material'
import { ShieldOutlined } from '@mui/icons-material'
import Link from 'next/link'
import type { Crumb } from './breadcrumbCrumbs'

export default function BreadcrumbLink({ crumb }: { crumb: Crumb }) {
  return (
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
  )
}
