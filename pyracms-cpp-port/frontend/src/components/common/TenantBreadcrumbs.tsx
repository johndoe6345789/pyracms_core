'use client'

import { Breadcrumbs, Typography } from '@mui/material'
import {
  NavigateNextOutlined,
} from '@mui/icons-material'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

const LABELS: Record<string, string> = {
  articles: 'Articles', forum: 'Forum',
  gallery: 'Gallery', games: 'Games',
  dependencies: 'Dependencies',
  snippets: 'Code Snippets', code: 'Code',
  users: 'Users', admin: 'Admin',
  settings: 'Settings',
  features: 'Feature Toggles',
  menus: 'Menus', acl: 'ACL', files: 'Files',
  backup: 'Backup', analytics: 'Analytics',
  templates: 'Templates', styles: 'Styles',
  create: 'Create', edit: 'Edit',
  revisions: 'Revisions', new: 'New',
  thread: 'Thread', picture: 'Picture',
}

function humanize(s: string): string {
  return LABELS[s] || s.split('-').map(
    (w) => w.charAt(0).toUpperCase()
      + w.slice(1)).join(' ')
}

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

  type Crumb = { label: string; href: string }
  const crumbs: Crumb[] = [
    { label: 'Home', href: `/site/${slug}` },
  ]
  let cur = `/site/${slug}`
  for (const s of segs) {
    cur += `/${s}`
    crumbs.push({
      label: humanize(s), href: cur })
  }
  const last = crumbs[crumbs.length - 1]

  return (
    <Breadcrumbs
      separator={<NavigateNextOutlined
        sx={{ fontSize: 16 }} />}
      sx={{ mb: 2, mt: 1 }}
      data-testid="tenant-breadcrumbs">
      {crumbs.slice(0, -1).map((c) => (
        <Link key={c.href} href={c.href}
          data-testid={
            `breadcrumb-${c.label}`}
          style={{ color: 'inherit',
            textDecoration: 'none',
            fontSize: '0.875rem' }}>
          {c.label}
        </Link>))}
      <Typography variant="body2"
        color="text.primary"
        sx={{ fontWeight: 600 }}>
        {last.label}
      </Typography>
    </Breadcrumbs>
  )
}
