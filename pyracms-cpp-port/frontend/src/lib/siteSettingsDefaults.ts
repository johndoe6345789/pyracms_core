import type { SiteSettings } from './siteSettings'

/** What a site already knows about itself, used to fill blank settings. */
export interface SiteBasics {
  name: string
  description: string
}

/**
 * Sensible starting values for a site that has not filled its settings in:
 * name and description come from the site itself, and the search-engine
 * title and description follow them. A field the owner has touched (`edited`)
 * is left alone, even if they emptied it. The contact email is never
 * guessed: it is published in the footer.
 */
export function withSiteDefaults(
  settings: SiteSettings,
  site: SiteBasics | null,
  edited: Partial<SiteSettings> = {},
): SiteSettings {
  const out = { ...settings }
  const fill = <K extends keyof SiteSettings>(k: K, v: string) => {
    if (!(k in edited) && out[k] === '') (out as Record<K, string>)[k] = v
  }
  fill('site_name', site?.name ?? '')
  fill('site_description', site?.description ?? '')
  fill('seo_title', out.site_name)
  fill('seo_description', out.site_description)
  return out
}
