/** A search hit's site-relative url ("/articles/x") as a page of the site. */
export function siteUrl(slug: string, url: string): string {
  if (!slug || !url.startsWith('/') || url.startsWith('/site/')) return url
  return `/site/${slug}${url}`
}

/** The search page of a site, for a query (and optionally kind and page). */
export function searchPagePath(
  slug: string,
  o: { q?: string; type?: string; page?: number } = {},
): string {
  const p = new URLSearchParams()
  if (o.q) p.set('q', o.q)
  if (o.type && o.type !== 'all') p.set('type', o.type)
  if (o.page && o.page > 1) p.set('page', String(o.page))
  const qs = p.toString()
  return `/site/${slug}/search${qs ? `?${qs}` : ''}`
}
