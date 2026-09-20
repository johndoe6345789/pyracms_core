import { siteSettingsFrom, SITE_SETTING_DEFAULTS } from '@/lib/siteSettings'
import { siteMetadata } from '@/lib/siteMetadata'
import { validateSettings } from '@/components/admin/settings/validateSettings'

const BAD_URL = 'javascript:alert(1)'

it('defaults when nothing is stored', () => {
  expect(siteSettingsFrom([])).toEqual(SITE_SETTING_DEFAULTS)
})

it('reads typed values and ignores unknown or junk ones', () => {
  const s = siteSettingsFrom([
    { name: 'site_name', value: 'Hi' },
    { name: 'registration_open', value: 'false' },
    { name: 'comments_enabled', value: 'true' },
    { name: 'default_theme', value: 'purple' },
    { name: 'site_logo_url', value: BAD_URL },
    { name: 'site_favicon_url', value: 'https://x.test/f.ico' },
    { name: 'feature_forum', value: 'false' },
    { name: 5, value: 'x' },
  ])
  expect(s.site_name).toBe('Hi')
  expect(s.registration_open).toBe(false)
  expect(s.comments_enabled).toBe(true)
  expect(s.default_theme).toBe('system')
  expect(s.site_logo_url).toBe('')
  expect(s.site_favicon_url).toBe('https://x.test/f.ico')
  const dark = siteSettingsFrom([{ name: 'default_theme', value: 'dark' }])
  expect(dark.default_theme).toBe('dark')
  expect(siteSettingsFrom([{ name: 'site_name' }]).site_name).toBe('')
})

it('builds metadata, preferring the SEO fields', () => {
  expect(siteMetadata(null)).toEqual({})
  expect(siteMetadata(SITE_SETTING_DEFAULTS).title).toBeUndefined()
  const m = siteMetadata({
    ...SITE_SETTING_DEFAULTS,
    site_name: 'Hi',
    site_description: 'desc',
    seo_title: 'Seo',
    site_logo_url: 'https://x.test/l.png',
    site_favicon_url: '/f.ico',
  })
  expect(m.title).toEqual({ default: 'Seo', template: '%s | Hi' })
  expect(m.description).toBe('desc')
  expect(m.icons).toEqual({ icon: '/f.ico' })
  expect(m.openGraph?.images).toEqual(['https://x.test/l.png'])
  const t = siteMetadata({ ...SITE_SETTING_DEFAULTS, seo_title: 'T' })
  expect(t.title).toEqual({ default: 'T', template: '%s' })
})

it('validates email and image urls', () => {
  expect(validateSettings(SITE_SETTING_DEFAULTS)).toEqual({})
  const bad = validateSettings({
    ...SITE_SETTING_DEFAULTS,
    contact_email: 'nope',
    site_logo_url: BAD_URL,
  })
  expect(Object.keys(bad).sort()).toEqual(['contact_email', 'site_logo_url'])
})
