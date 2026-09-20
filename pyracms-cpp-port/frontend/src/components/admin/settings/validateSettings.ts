import { safeSrc } from '@/lib/safeUrl'
import type { SiteSettings } from '@/lib/siteSettings'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Field-level problems; an empty object means the form may be saved. */
export function validateSettings(
  s: SiteSettings,
): Partial<Record<keyof SiteSettings, string>> {
  const bad: Partial<Record<keyof SiteSettings, string>> = {}
  if (s.contact_email && !EMAIL.test(s.contact_email))
    bad.contact_email = 'Enter a valid email address.'
  for (const k of ['site_logo_url', 'site_favicon_url'] as const)
    if (s[k] && !safeSrc(s[k])) bad[k] = 'Enter an http(s) or relative URL.'
  return bad
}
