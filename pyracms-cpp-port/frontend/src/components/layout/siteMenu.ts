import { safeHref } from '@/lib/safeUrl'
import type { MenuItemRow } from '@/hooks/admin/menuData'
import type { NavEntry } from './navTypes'

export interface MenuViewer {
  signedIn: boolean
  canAdmin: boolean
}

/** May this visitor see an item with the given permission level? */
export function menuItemVisible(permission: string, v: MenuViewer): boolean {
  if (permission === 'public') return true
  if (permission === 'authenticated') return v.signedIn
  if (permission === 'admin') return v.canAdmin
  return false
}

/**
 * Where a configured route leads. `/x` is a page on this site (`/` is its
 * home), `https://…` and `mailto:` go where they say; anything else that
 * could run script is refused (null).
 */
export function menuHref(slug: string, route: string): string | null {
  const r = route.trim()
  if (r === '/') return `/site/${slug}`
  if (r.startsWith('/') && !r.startsWith('//')) return `/site/${slug}${r}`
  if (/^(https?:\/\/|mailto:)/i.test(r)) return safeHref(r) ?? null
  if (!r || /^[a-z][a-z0-9+.-]*:/i.test(r) || r.startsWith('//')) return null
  return `/site/${slug}/${r}`
}

/**
 * The site owner's own links, in the order and wording they configured,
 * limited to what this visitor may see.
 */
export function menuEntries(
  slug: string,
  items: MenuItemRow[],
  viewer: MenuViewer,
): NavEntry[] {
  return [...items]
    .sort((a, b) => a.position - b.position || a.id - b.id)
    .filter((i) => i.name.trim() && menuItemVisible(i.permissions, viewer))
    .flatMap((i) => {
      const href = menuHref(slug, i.route)
      if (!href) return []
      const external = !href.startsWith('/')
      return [
        {
          key: `menu-${i.id}`,
          label: i.name.trim(),
          href,
          icon: null,
          testId: `menu-link-${i.id}`,
          ...(external && { external: true }),
        },
      ]
    })
}
