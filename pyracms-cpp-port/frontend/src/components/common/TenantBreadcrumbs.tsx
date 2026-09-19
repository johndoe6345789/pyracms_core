'use client'

import { Breadcrumbs, Typography } from '@mui/material'
import { NavigateNextOutlined } from '@mui/icons-material'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { buildCrumbs } from './tenantCrumbs'

export default function TenantBreadcrumbs() {
  const params = useParams()
  const pathname = usePathname()
  const slug = params.slug as string
  if (!slug || !pathname) return null
  const pfx = `/site/${slug}/`
  if (!pathname.startsWith(pfx)) return null
  const rel = pathname.slice(pfx.length)
  if (!rel) return null
  const segs = rel.split('/').filter(Boolean)
  if (segs.length === 0) return null

  const crumbs = buildCrumbs(slug, segs)
  const last = crumbs[crumbs.length - 1]!

  return (
    <Breadcrumbs
      separator={<NavigateNextOutlined sx={{ fontSize: 16 }} />}
      sx={{ mb: 2, mt: 1 }}
      data-testid="tenant-breadcrumbs"
    >
      {crumbs.slice(0, -1).map((c) => (
        <Link
          key={c.href}
          href={c.href}
          data-testid={`breadcrumb-${c.label}`}
          style={{
            color: 'inherit',
            textDecoration: 'none',
            fontSize: '0.875rem',
          }}
        >
          {c.label}
        </Link>
      ))}
      <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
        {last.label}
      </Typography>
    </Breadcrumbs>
  )
}
