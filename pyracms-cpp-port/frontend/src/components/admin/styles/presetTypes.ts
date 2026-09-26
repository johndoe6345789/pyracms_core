import type { ThemeConfig } from './themeConfig'

export interface ThemePreset {
  name: string
  tagline: string
  theme: ThemeConfig
}

/** Shorthand so a preset reads as one small block. */
export const preset = (
  name: string,
  tagline: string,
  colors: [string, string, string, string],
  look: [string, number, number],
): ThemePreset => ({
  name,
  tagline,
  theme: {
    primaryColor: colors[0],
    secondaryColor: colors[1],
    backgroundColor: colors[2],
    textColor: colors[3],
    fontFamily: look[0],
    borderRadius: look[1],
    spacing: look[2],
  },
})
