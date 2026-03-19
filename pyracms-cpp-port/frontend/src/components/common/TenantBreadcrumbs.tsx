'use client'

import { Breadcrumbs, Typography } from '@mui/material'
import { NavigateNextOutlined } from '@mui/icons-material'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

const LABEL_MAP: Record<string, string> = {
  articles: 'Articles',
  forum: 'Forum',
  gallery: 'Gallery',
  games: 'Games',
  dependencies: 'Dependencies',
  snippets: 'Code Snippets',
  code: 'Code',
  users: 'Users',
  admin: 'Admin',
  settings: 'Settings',
  features: 'Feature Toggles',
  menus: 'Menus',
  acl: 'ACL',
  files: 'Files',
  backup: 'Backup',
  analytics: 'Analytics',
  templates: 'Templates',
  styles: 'Styles',
  create: 'Create',
  edit: 'Edit',
  revisions: 'Revisions',
  new: 'New',
  thread: 'Thread',
  picture: 'Picture',
}

function humanize(segment: string): string {
  return LABEL_MAP[segment] || segment.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function TenantBreadcrumbs() {
  const params = useParams()
  const pathname = usePathname()
  const slug = params.slug as string

  if (!slug || !pathname) return null

  // Strip /site/{slug}/ prefix to get the relative path
  const prefix = `/site/${slug}/`
  if (!pathname.startsWith(prefix)) return null

  const relative = pathname.slice(prefix.length)
  if (!relative) return null // site home, no breadcrumbs needed

  const segments = relative.split('/').filter(Boolean)
  if (segments.length === 0) return null

  // Build breadcrumb items: Home + each segment
  const crumbs: { label: string; href: string }[] = [
    { label: 'Home', href: `/site/${slug}` },
  ]

  let currentPath = `/site/${slug}`
  for (const seg of segments) {
    currentPath += `/${seg}`
    crumbs.push({ label: humanize(seg), href: currentPath })
  }

  return (
    <Breadcrumbs
      separator={<NavigateNextOutlined sx={{ fontSize: 16 }} />}
      sx={{ mb: 2, mt: 1 }}
    >
      {crumbs.slice(0, -1).map((crumb) => (
        <Link
          key={crumb.href}
          href={crumb.href}
          style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.875rem' }}
        >
          {crumb.label}
        </Link>
      ))}
      <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
        {crumbs[crumbs.length - 1].label}
      </Typography>
    </Breadcrumbs>
  )
}
