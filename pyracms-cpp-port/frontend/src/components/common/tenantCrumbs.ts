const LABELS: Record<string, string> = {
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

export function humanize(s: string): string {
  return (
    LABELS[s] ||
    s
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  )
}

export type Crumb = { label: string; href: string }

export function buildCrumbs(slug: string, segs: string[]): Crumb[] {
  const crumbs: Crumb[] = [{ label: 'Home', href: `/site/${slug}` }]
  let cur = `/site/${slug}`
  for (const s of segs) {
    cur += `/${s}`
    crumbs.push({ label: humanize(s), href: cur })
  }
  return crumbs
}
