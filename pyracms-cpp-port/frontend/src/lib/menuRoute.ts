/**
 * The menu editor has one "Route / URL" box, but the API stores a page on the
 * site (`routePath`, type `route`) and an outside link (`url`, type `url`)
 * separately. Sending `route` stored nothing at all.
 */
export interface ApiRoute {
  routePath: string
  url: string
  type: 'route' | 'url'
}

/** The box's text -> the fields the API stores. */
export function toApiRoute(route: string): ApiRoute {
  const r = route.trim()
  return /^(https?:\/\/|mailto:)/i.test(r)
    ? { routePath: '', url: r, type: 'url' }
    : { routePath: r, url: '', type: 'route' }
}

/** A stored item -> the text to show in the box. */
export function fromApiRoute(item: {
  url?: unknown
  routePath?: unknown
}): string {
  const pick = (v: unknown) => (typeof v === 'string' ? v : '')
  return pick(item.url) || pick(item.routePath)
}
