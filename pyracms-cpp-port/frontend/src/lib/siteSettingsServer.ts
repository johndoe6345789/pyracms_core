import { serverApiOrigin, tenantIdOf } from './siteOrigin'
import { siteSettingsFrom, type SiteSettings } from './siteSettings'

/** The site's guided settings for server rendering, or null. */
export async function fetchSiteSettings(
  slug: string,
): Promise<SiteSettings | null> {
  try {
    const id = await tenantIdOf(slug)
    if (!id) return null
    const res = await fetch(
      `${serverApiOrigin()}/api/settings?tenant_id=${id}`,
      {
        next: { revalidate: 60 },
      },
    )
    if (!res.ok) return null
    return siteSettingsFrom(await res.json())
  } catch {
    return null
  }
}
