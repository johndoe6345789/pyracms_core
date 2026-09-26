import { applySiteTheme } from '@/lib/siteTheme'
import { lightTheme, darkTheme } from '@/lib/theme'
import { DEFAULT_THEME } from '@/components/admin/styles/themeConfig'
import { DEFAULT_DARK_THEME } from '@/components/admin/styles/siteThemes'

interface WithVars {
  vars?: {
    palette: { background: { default: string }; primary: { main: string } }
  }
}

const pink = { ...DEFAULT_THEME, backgroundColor: '#fff0f5' }
const night = { ...DEFAULT_DARK_THEME, primaryColor: '#4dd0e1' }

// The page paints from the theme's CSS variables, so those must carry the
// site's colours, not the built-in theme's.
it.each([
  ['light', lightTheme, false, '#fff0f5', pink.primaryColor],
  ['dark', darkTheme, true, '#121212', '#4dd0e1'],
])('%s style reaches the CSS variables', (_n, base, dark, bg, main) => {
  const t = applySiteTheme(base, { light: pink, dark: night }, dark)
  const vars = (t as unknown as WithVars).vars?.palette
  expect(vars?.background.default).toContain(bg)
  expect(vars?.background.default).not.toContain('#f8fafc')
  expect(vars?.primary.main).toContain(main)
  expect(t.palette.mode).toBe(dark ? 'dark' : 'light')
})
