/** A search hit's site-relative url ("/articles/x") as a page of the site. */
export function siteUrl(slug: string, url: string): string {
  if (!slug || !url.startsWith('/') || url.startsWith('/site/')) return url
  return `/site/${slug}${url}`
}
