/** Something a menu link can point at, offered while the owner types. */
export interface MenuTarget {
  /** The route stored on the item: /articles/x, /gallery/3, https://... */
  value: string
  label: string
  group: string
  hint?: string
}

export const SECTION_GROUP = 'Site sections'
export const PAGE_GROUP = 'Pages'
export const ALBUM_GROUP = 'Photo albums'
export const TAG_GROUP = 'Tags'
export const OUTSIDE_GROUP = 'Outside link'

export const SECTIONS: MenuTarget[] = [
  { value: '/', label: 'Home', group: SECTION_GROUP },
  { value: '/articles', label: 'All articles', group: SECTION_GROUP },
  { value: '/forum', label: 'Forum', group: SECTION_GROUP },
  { value: '/gallery', label: 'Photo albums', group: SECTION_GROUP },
  { value: '/snippets', label: 'Code snippets', group: SECTION_GROUP },
  { value: '/tags', label: 'Tag cloud', group: SECTION_GROUP },
  { value: '/games', label: 'Games', group: SECTION_GROUP },
  { value: '/dependencies', label: 'Game dependencies', group: SECTION_GROUP },
  { value: '/download', label: 'Download the client', group: SECTION_GROUP },
]

const enc = encodeURIComponent

export const pageTarget = (name: string, title: string): MenuTarget => ({
  value: `/articles/${enc(name)}`,
  label: title || name,
  group: PAGE_GROUP,
})

export const albumTarget = (id: number, title: string): MenuTarget => ({
  value: `/gallery/${id}`,
  label: title,
  group: ALBUM_GROUP,
})

export const tagTarget = (tag: string, uses: number): MenuTarget => ({
  value: `/tags/${enc(tag)}`,
  label: tag,
  group: TAG_GROUP,
  hint: `${uses} item${uses === 1 ? '' : 's'}`,
})

const same = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase()

/** Options that match what was typed (title or route), best first; a typed
 * outside link or path is offered as itself so it can be picked. */
export function matchTargets(all: MenuTarget[], typed: string): MenuTarget[] {
  const q = typed.trim().toLowerCase()
  if (!q) return all
  const hits = all
    .filter((t) => `${t.label} ${t.value}`.toLowerCase().includes(q))
    .sort(
      (a, b) =>
        Number(b.label.toLowerCase().startsWith(q)) -
        Number(a.label.toLowerCase().startsWith(q)),
    )
  const custom =
    /^(https?:\/\/|mailto:)/i.test(q) || q.startsWith('/')
      ? all.some((t) => same(t.value, typed))
        ? []
        : [{ value: typed.trim(), label: typed.trim(), group: OUTSIDE_GROUP }]
      : []
  return [...hits, ...custom]
}

/** A friendly name for a stored route, else the route itself. */
export function targetTitle(all: MenuTarget[], route: string): string {
  return all.find((t) => same(t.value, route))?.label ?? route
}

/** What the visitor's browser will open, for the "Opens:" helper text. */
export function opensText(slug: string, route: string): string {
  const r = route.trim()
  if (!r) return ''
  if (/^(https?:\/\/|mailto:)/i.test(r)) return `Opens ${r} (outside your site)`
  return `Opens /site/${slug}${r === '/' ? '' : r}`
}
