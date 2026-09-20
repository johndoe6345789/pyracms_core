import type { Metadata } from 'next'
import type { SiteSettings } from './siteSettings'

/** Page metadata built from the site's settings (SEO fields win). */
export function siteMetadata(s: SiteSettings | null): Metadata {
  if (!s) return {}
  const name = s.site_name
  const title = s.seo_title || name
  const description = s.seo_description || s.site_description
  const images = s.site_logo_url ? [s.site_logo_url] : undefined
  return {
    title: title
      ? { default: title, template: name ? `%s | ${name}` : '%s' }
      : undefined,
    description: description || undefined,
    icons: s.site_favicon_url ? { icon: s.site_favicon_url } : undefined,
    openGraph: { siteName: name || undefined, title, description, images },
  }
}
