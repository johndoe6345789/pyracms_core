import { parseSiteThemes, applySiteTheme } from '@/lib/siteTheme'
import { lift } from '@/lib/colorContrast'
import { lightTheme, darkTheme } from '@/lib/theme'
import { slugFromPath } from '@/lib/siteSlug'
import { DEFAULT_THEME } from '@/components/admin/styles/themeConfig'
import {
  DEFAULT_DARK_THEME,
  type SiteThemes,
} from '@/components/admin/styles/siteThemes'

const saved = {
  ...DEFAULT_THEME,
  primaryColor: '#ff0000',
  fontFamily: 'Georgia, serif',
  borderRadius: 99,
}

const both: SiteThemes = {
  light: saved,
  dark: { ...DEFAULT_DARK_THEME, primaryColor: '#00ff00' },
}

describe('parseSiteThemes', () => {
  it('reads a light and dark style and clamps numbers', () => {
    const t = parseSiteThemes(JSON.stringify({ version: 2, ...both }))
    expect(t?.light.primaryColor).toBe('#ff0000')
    expect(t?.light.borderRadius).toBe(32)
    expect(t?.dark.primaryColor).toBe('#00ff00')
    expect(t?.dark.backgroundColor).toBe('#121212')
  })
  it('reads the old single-theme format as the light look', () => {
    const t = parseSiteThemes(JSON.stringify(saved))
    expect(t?.light.primaryColor).toBe('#ff0000')
    expect(t?.dark).toEqual(DEFAULT_DARK_THEME)
  })
  it.each([
    ['not json'],
    [JSON.stringify({ ...saved, primaryColor: 'red;}body{' })],
    [JSON.stringify({ ...saved, fontFamily: 'Evil, x' })],
    [JSON.stringify({ light: saved, dark: { primaryColor: 'x;' } })],
  ])('rejects %s', (raw) => expect(parseSiteThemes(raw)).toBeNull())
})

describe('applySiteTheme', () => {
  it('uses the light look in light mode', () => {
    const t = applySiteTheme(lightTheme, both, false)
    expect(t.palette.primary.main).toBe('#ff0000')
    expect(t.palette.background.default).toBe(saved.backgroundColor)
    expect(t.typography.fontFamily).toBe('Georgia, serif')
  })
  it('uses its own dark look in dark mode', () => {
    const t = applySiteTheme(darkTheme, both, true)
    expect(t.palette.primary.main).toBe('#00ff00')
    expect(t.palette.background.default).toBe('#121212')
    expect(t.palette.background.paper).toBe(lift('#121212'))
    expect(t.palette.mode).toBe('dark')
  })
})

it('lift makes a surface a little lighter, and never overflows', () => {
  expect(lift('#121212')).toBe('#282828')
  expect(lift('#ffffff')).toBe('#ffffff')
})

it('slugFromPath reads the tenant slug', () => {
  expect(slugFromPath('/site/abc/x')).toBe('abc')
  expect(slugFromPath('/auth/login')).toBeNull()
  expect(slugFromPath(null)).toBeNull()
})
