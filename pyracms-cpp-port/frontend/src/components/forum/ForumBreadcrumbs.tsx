'use client'

import { Breadcrumbs, Typography, Link as MuiLink } from '@mui/material'
import Link from 'next/link'

export interface Crumb {
  label: string
  href?: string
}

export function ForumBreadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <Breadcrumbs
      aria-label="Forum breadcrumbs"
      sx={{ mb: 2 }}
      data-testid="forum-breadcrumbs"
    >
      {crumbs.map((c) =>
        c.href ? (
          <MuiLink
            key={c.label}
            component={Link}
            href={c.href}
            underline="hover"
            color="inherit"
          >
            {c.label}
          </MuiLink>
        ) : (
          <Typography
            key={c.label}
            color="text.primary"
            noWrap
            sx={{ maxWidth: 320 }}
          >
            {c.label}
          </Typography>
        ),
      )}
    </Breadcrumbs>
  )
}
