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

export interface Crumb {
  label: string
  href: string
}

/** Build ordered crumbs from a pathname string. */
export function buildCrumbs(pathname: string): Crumb[] {
  const parts = pathname.split('/').filter(Boolean)
  return parts.map((segment, idx) => ({
    label: labelFor(segment),
    href: '/' + parts.slice(0, idx + 1).join('/'),
  }))
}
