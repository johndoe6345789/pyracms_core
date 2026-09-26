import { createElement } from 'react'
import { menuHref, menuItemVisible, type MenuViewer } from './menuLinks'
import { iconFor } from '@/lib/menuIcons'

export { menuHref, menuItemVisible, type MenuViewer } from './menuLinks'
import type { MenuItemRow } from '@/hooks/admin/menuData'
import type { NavEntry } from './navTypes'

/** The icon element for a stored name, or null (none / unknown). */
function iconNode(name: string) {
  const found = iconFor(name)
  return found ? createElement(found.Icon) : null
}

function linkEntry(slug: string, i: MenuItemRow): NavEntry[] {
  const href = menuHref(slug, i.route)
  if (!href) return []
  const external = !href.startsWith('/')
  return [
    {
      key: `menu-${i.id}`,
      label: i.name.trim(),
      href,
      icon: iconNode(i.icon),
      testId: `menu-link-${i.id}`,
      ...(external && { external: true }),
    },
  ]
}

/**
 * The site owner's own links, in the order and wording they configured,
 * limited to what this visitor may see. A folder becomes a dropdown of its
 * links (and is left out when none of them may be seen).
 */
export function menuEntries(
  slug: string,
  items: MenuItemRow[],
  viewer: MenuViewer,
): NavEntry[] {
  const seen = [...items]
    .sort((a, b) => a.position - b.position || a.id - b.id)
    .filter((i) => i.name.trim() && menuItemVisible(i.permissions, viewer))
  const inFolder = (id: number) => seen.filter((i) => i.parentId === id)
  return seen
    .filter((i) => !i.parentId || !seen.some((f) => f.id === i.parentId))
    .flatMap((i) => {
      if (i.type !== 'folder') return linkEntry(slug, i)
      const children = inFolder(i.id).flatMap((c) => linkEntry(slug, c))
      return children.length
        ? [
            {
              key: `menu-${i.id}`,
              label: i.name.trim(),
              href: '',
              icon: iconNode(i.icon),
              testId: `menu-folder-${i.id}`,
              children,
            },
          ]
        : []
    })
}
