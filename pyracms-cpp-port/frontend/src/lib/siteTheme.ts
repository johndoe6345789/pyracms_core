import { createTheme, type Theme } from '@mui/material/styles'
import {
  FONTS,
  pickTheme,
  type ThemeConfig,
} from '@/components/admin/styles/themeConfig'

export const THEME_KEY = 'site_theme'
export const THEME_EVENT = 'site-theme-changed'

const HEX = /^#[0-9a-f]{3,8}$/i
const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n))

/** Parses a stored theme; null unless every field is safe to apply. */
export function parseSiteTheme(raw: string): ThemeConfig | null {
  try {
    const t = pickTheme(JSON.parse(raw))
    const colors = [
      t.primaryColor,
      t.secondaryColor,
      t.backgroundColor,
      t.textColor,
    ]
    if (!colors.every((c) => HEX.test(c))) return null
    if (!FONTS.includes(t.fontFamily)) return null
    return {
      ...t,
      borderRadius: clamp(t.borderRadius, 0, 32),
      spacing: clamp(t.spacing, 4, 16),
    }
  } catch {
    return null
  }
}

/** Layers a saved site theme over a built-in light or dark theme. */
export function applySiteTheme(
  base: Theme,
  cfg: ThemeConfig,
  dark: boolean,
): Theme {
  return createTheme(base, {
    palette: {
      primary: { main: cfg.primaryColor },
      secondary: { main: cfg.secondaryColor },
      // Background and text colours are authored for light mode only
      ...(dark
        ? {}
        : {
            background: { default: cfg.backgroundColor },
            text: { primary: cfg.textColor },
          }),
    },
    typography: { fontFamily: cfg.fontFamily },
    shape: { borderRadius: cfg.borderRadius },
    spacing: cfg.spacing,
  })
}
