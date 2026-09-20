import {
  ALL_ON,
  flagsFromSettings,
  isFeatureOn,
  FEATURE_IDS,
} from '@/lib/siteFeatures'

describe('flagsFromSettings', () => {
  it('enables everything when nothing is set', () => {
    expect(flagsFromSettings([])).toEqual(ALL_ON)
    expect(FEATURE_IDS).toHaveLength(5)
  })

  it('turns off only an explicit "false"', () => {
    const f = flagsFromSettings([
      { name: 'feature_forum', value: 'false' },
      { name: 'feature_gallery', value: 'true' },
      { name: 'feature_articles', value: '' },
    ])
    expect(f.forum).toBe(false)
    expect(f.gallery).toBe(true)
    expect(f.articles).toBe(true)
    expect(f.hypernucleus).toBe(true)
  })

  it('ignores unrelated and unknown settings', () => {
    const f = flagsFromSettings([
      { name: 'site_name', value: 'false' },
      { name: 'feature_nope', value: 'false' },
      { name: 3, value: 'false' },
      {},
    ])
    expect(f).toEqual(ALL_ON)
  })
})

describe('isFeatureOn', () => {
  it('is optimistic without flags or an id', () => {
    expect(isFeatureOn(null, 'forum')).toBe(true)
    expect(isFeatureOn({ ...ALL_ON, forum: false }, undefined)).toBe(true)
  })

  it('reads the flag', () => {
    const flags = { ...ALL_ON, forum: false }
    expect(isFeatureOn(flags, 'forum')).toBe(false)
    expect(isFeatureOn(flags, 'gallery')).toBe(true)
  })
})
