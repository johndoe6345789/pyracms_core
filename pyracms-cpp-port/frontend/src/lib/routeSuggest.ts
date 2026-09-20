/** Guidance and suggestions for the menu-item "Route / URL" field. */

export interface RouteSuggestion {
  value: string
  hint: string
}

export const ROUTE_FORMAT_HELP =
  'A path on this site (/articles) or a full link (https://example.com)'

const SITE_ROUTES: RouteSuggestion[] = [
  { value: '/', hint: 'Site home' },
  { value: '/articles', hint: 'All articles' },
  { value: '/forum', hint: 'Forum' },
  { value: '/gallery', hint: 'Photo albums' },
  { value: '/games', hint: 'Hypernucleus games' },
  { value: '/dependencies', hint: 'Game dependencies' },
  { value: '/download', hint: 'Download Hypernucleus Client' },
  { value: '/snippets', hint: 'Code snippets' },
  { value: '/tags', hint: 'Tags' },
]

const SCHEMES = ['https://', 'http://', 'mailto:']

/** Empty string when the route is acceptable, otherwise what to fix. */
export function validateRoute(route: string): string {
  const r = route.trim()
  if (!r) return ''
  if (/\s/.test(r)) return 'A route cannot contain spaces'
  if (r.startsWith('//')) return 'Start with a single / or with https://'
  if (r.startsWith('/')) return ''
  if (/^(https?:\/\/|mailto:)\S+/i.test(r)) return ''
  if (/^[a-z][a-z0-9+.-]*:/i.test(r))
    return 'Only https://, http:// and mailto:'
  return 'Start with / for a page on this site, or https:// for a link'
}

/** Suggestions that narrow as the user types. */
export function suggestRoutes(input: string): RouteSuggestion[] {
  const q = input.trim().toLowerCase()
  if (!q) return SITE_ROUTES
  if (/^(https?:|mailto:)/.test(q) && q.length > 6) return []
  const path = q.startsWith('/') ? q : `/${q}`
  const hits = SITE_ROUTES.filter((s) => s.value.startsWith(path))
  const near = SITE_ROUTES.filter(
    (s) => !hits.includes(s) && s.value.includes(q.replace(/^\//, '')),
  )
  const links = SCHEMES.filter((s) => s.startsWith(q)).map((value) => ({
    value,
    hint: 'External link',
  }))
  return [...hits, ...near, ...links]
}
