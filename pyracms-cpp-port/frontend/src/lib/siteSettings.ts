import { safeSrc } from './safeUrl'

/** Guided site settings, stored as tenant settings under these names. */
export type DefaultTheme = 'system' | 'light' | 'dark'

export interface SiteSettings {
  site_name: string
  site_description: string
  site_logo_url: string
  site_favicon_url: string
  contact_email: string
  default_theme: DefaultTheme
  registration_open: boolean
  comments_enabled: boolean
  seo_title: string
  seo_description: string
}

export const SITE_SETTING_DEFAULTS: SiteSettings = {
  site_name: '',
  site_description: '',
  site_logo_url: '',
  site_favicon_url: '',
  contact_email: '',
  default_theme: 'system',
  registration_open: true,
  comments_enabled: true,
  seo_title: '',
  seo_description: '',
}

export const isSiteSettingKey = (k: string): k is keyof SiteSettings =>
  k in SITE_SETTING_DEFAULTS

const THEMES: string[] = ['system', 'light', 'dark']

/** Reads the guided settings out of raw records; junk falls to defaults. */
export function siteSettingsFrom(
  records: { name?: unknown; value?: unknown }[],
): SiteSettings {
  const out: Record<string, string | boolean> = { ...SITE_SETTING_DEFAULTS }
  for (const r of records) {
    if (typeof r.name !== 'string' || !isSiteSettingKey(r.name)) continue
    const raw = String(r.value ?? '')
    const dflt = SITE_SETTING_DEFAULTS[r.name]
    if (typeof dflt === 'boolean') out[r.name] = raw !== 'false'
    else if (r.name === 'default_theme') {
      out[r.name] = THEMES.includes(raw) ? raw : 'system'
    } else if (r.name.endsWith('_url')) out[r.name] = safeSrc(raw) ?? ''
    else out[r.name] = raw
  }
  return out as unknown as SiteSettings
}
