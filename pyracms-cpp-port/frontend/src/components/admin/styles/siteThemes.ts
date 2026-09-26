import { DEFAULT_THEME, pickTheme, type ThemeConfig } from './themeConfig'

/** The dark counterpart: same accents, night colours. */
export const DEFAULT_DARK_THEME: ThemeConfig = {
  ...DEFAULT_THEME,
  primaryColor: '#90caf9',
  secondaryColor: '#ce93d8',
  backgroundColor: '#121212',
  textColor: '#e0e0e0',
}

/** A site's style: one look for light mode, one for dark mode. */
export interface SiteThemes {
  light: ThemeConfig
  dark: ThemeConfig
}

export type ThemeMode = keyof SiteThemes

export const DEFAULT_THEMES: SiteThemes = {
  light: DEFAULT_THEME,
  dark: DEFAULT_DARK_THEME,
}

/** Reads a stored or imported style. Old sites saved one flat theme: that
 * becomes the light look, with the usual dark look beside it. */
export function pickThemes(raw: unknown): SiteThemes {
  const doc = (raw && typeof raw === 'object' ? raw : {}) as Record<
    string,
    unknown
  >
  if (doc.light || doc.dark)
    return {
      light: doc.light ? pickTheme(doc.light) : DEFAULT_THEME,
      dark: doc.dark
        ? { ...DEFAULT_DARK_THEME, ...pickTheme(doc.dark) }
        : DEFAULT_DARK_THEME,
    }
  return { light: pickTheme(doc), dark: DEFAULT_DARK_THEME }
}

/** Downloads both looks as one file. */
export function exportThemes(themes: SiteThemes) {
  const blob = new Blob([JSON.stringify({ version: 2, ...themes }, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'site-styles.json'
  a.click()
  URL.revokeObjectURL(url)
}

const MAX_IMPORT_BYTES = 1024 * 1024

/** Lets the user pick a styles file (either format) and applies it. */
export function importThemes(apply: (t: SiteThemes) => void) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file || file.size > MAX_IMPORT_BYTES) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        apply(pickThemes(JSON.parse(ev.target?.result as string)))
      } catch {
        console.error('Invalid styles JSON')
      }
    }
    reader.readAsText(file)
  }
  input.click()
}
