import { createTheme, type Theme } from '@mui/material/styles'
import { FONTS, type ThemeConfig } from '@/components/admin/styles/themeConfig'
import {
  pickThemes,
  type SiteThemes,
} from '@/components/admin/styles/siteThemes'
import { lift } from './colorContrast'
import { baseTheme } from './theme'

export const THEME_KEY = 'site_theme'
export const THEME_EVENT = 'site-theme-changed'

const HEX = /^#[0-9a-f]{3,8}$/i
const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n))

function safeLook(t: ThemeConfig): ThemeConfig | null {
  const colors = [
    t.primaryColor,
    t.secondaryColor,
    t.backgroundColor,
    t.textColor,
  ]
  if (!colors.every((c) => HEX.test(c)) || !FONTS.includes(t.fontFamily))
    return null
  return {
    ...t,
    borderRadius: clamp(t.borderRadius, 0, 32),
    spacing: clamp(t.spacing, 4, 16),
  }
}

/** Parses a stored style (light and dark looks); null unless every value in
 * both is safe to apply. The old single-theme format still reads. */
export function parseSiteThemes(raw: string): SiteThemes | null {
  try {
    const t = pickThemes(JSON.parse(raw))
    const light = safeLook(t.light)
    const dark = safeLook(t.dark)
    return light && dark ? { light, dark } : null
  } catch {
    return null
  }
}

/** Layers the site's style over the built-in light or dark theme: the look
 * saved for the mode being shown. */
export function applySiteTheme(
  base: Theme,
  themes: SiteThemes,
  dark: boolean,
): Theme {
  const cfg = dark ? themes.dark : themes.light
  // Built from the shared options, not layered on `base`: a theme made with
  // cssVariables keeps its own colour variables, which would win over ours.
  return createTheme({
    ...baseTheme,
    cssVariables: true,
    palette: {
      mode: dark ? 'dark' : 'light',
      primary: { main: cfg.primaryColor },
      secondary: { main: cfg.secondaryColor },
      background: {
        default: cfg.backgroundColor,
        paper: dark ? lift(cfg.backgroundColor) : cfg.backgroundColor,
      },
      text: {
        primary: cfg.textColor,
        secondary: base.palette.text.secondary,
      },
      divider: base.palette.divider,
    },
    typography: { fontFamily: cfg.fontFamily },
    shape: { borderRadius: cfg.borderRadius },
    spacing: cfg.spacing,
  })
}
