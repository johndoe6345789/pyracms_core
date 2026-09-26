import { BOLD_PRESETS } from './presetsBold'
import { CALM_PRESETS } from './presetsCalm'
import type { ThemeConfig } from './themeConfig'
import type { SiteThemes } from './siteThemes'

export type { ThemePreset } from './presetTypes'

/** Ready-made looks, calm ones first. */
export const THEME_PRESETS = [...CALM_PRESETS, ...BOLD_PRESETS]

const KEYS: (keyof ThemeConfig)[] = [
  'primaryColor',
  'secondaryColor',
  'backgroundColor',
  'textColor',
  'fontFamily',
  'borderRadius',
  'spacing',
]

/** Are two themes the same look? */
export function sameTheme(a: ThemeConfig, b: ThemeConfig): boolean {
  return KEYS.every((k) => a[k] === b[k])
}

/** Are two styles the same in both light and dark? */
export function sameThemes(a: SiteThemes, b: SiteThemes): boolean {
  return sameTheme(a.light, b.light) && sameTheme(a.dark, b.dark)
}
