import { SITE_SETTING_DEFAULTS, type SiteSettings } from '@/lib/siteSettings'
import { withSiteDefaults } from '@/lib/siteSettingsDefaults'

const blank = SITE_SETTING_DEFAULTS
const site = { name: 'Demo Site', description: 'A place to write' }

describe('withSiteDefaults', () => {
  it('starts a blank site from its own name and description', () => {
    const s = withSiteDefaults(blank, site)
    expect(s.site_name).toBe('Demo Site')
    expect(s.site_description).toBe('A place to write')
  })

  it('makes the search-engine fields follow them', () => {
    const s = withSiteDefaults(blank, site)
    expect(s.seo_title).toBe('Demo Site')
    expect(s.seo_description).toBe('A place to write')
  })

  it('keeps what the owner already saved', () => {
    const saved: SiteSettings = {
      ...blank,
      site_name: 'Mine',
      seo_title: 'Custom title',
    }
    const s = withSiteDefaults(saved, site)
    expect(s.site_name).toBe('Mine')
    expect(s.seo_title).toBe('Custom title')
    expect(s.seo_description).toBe('A place to write')
  })

  it('lets the owner empty a field they touched', () => {
    const s = withSiteDefaults(blank, site, { site_name: '' })
    expect(s.site_name).toBe('')
    expect(s.seo_title).toBe('') // follows the (empty) name
  })

  it('never guesses the contact email, which is published', () => {
    expect(withSiteDefaults(blank, site).contact_email).toBe('')
  })

  it('leaves everything blank when the site is not loaded', () => {
    expect(withSiteDefaults(blank, null)).toEqual(blank)
  })
})
