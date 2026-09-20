import { parseSiteTheme, applySiteTheme } from '@/lib/siteTheme'
import { lightTheme, darkTheme } from '@/lib/theme'
import { slugFromPath } from '@/lib/siteSlug'
import { DEFAULT_THEME } from '@/components/admin/styles/themeConfig'

const saved = {
  ...DEFAULT_THEME,
  primaryColor: '#ff0000',
  fontFamily: 'Georgia, serif',
  borderRadius: 99,
}

describe('parseSiteTheme', () => {
  it('accepts a valid theme and clamps numbers', () => {
    const t = parseSiteTheme(JSON.stringify(saved))
    expect(t?.primaryColor).toBe('#ff0000')
    expect(t?.borderRadius).toBe(32)
  })
  it.each([
    ['not json'],
    [JSON.stringify({ ...saved, primaryColor: 'red;}body{' })],
    [JSON.stringify({ ...saved, fontFamily: 'Evil, x' })],
  ])('rejects %s', (raw) => expect(parseSiteTheme(raw)).toBeNull())
})

describe('applySiteTheme', () => {
  it('overrides the palette and font', () => {
    const t = applySiteTheme(lightTheme, saved, false)
    expect(t.palette.primary.main).toBe('#ff0000')
    expect(t.palette.background.default).toBe(saved.backgroundColor)
    expect(t.typography.fontFamily).toBe('Georgia, serif')
  })
  it('keeps dark backgrounds', () => {
    const t = applySiteTheme(darkTheme, saved, true)
    expect(t.palette.background.default).toBe(
      darkTheme.palette.background.default,
    )
    expect(t.palette.mode).toBe('dark')
  })
})

it('slugFromPath reads the tenant slug', () => {
  expect(slugFromPath('/site/abc/x')).toBe('abc')
  expect(slugFromPath('/auth/login')).toBeNull()
  expect(slugFromPath(null)).toBeNull()
})
