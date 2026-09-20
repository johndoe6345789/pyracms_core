import { createTheme, type Theme } from '@mui/material/styles'

/**
 * The games library is a dark, Steam-like panel whatever the site theme is.
 * A dark theme of its own keeps every control inside readable (light text,
 * visible borders and selected states) instead of inheriting the site's
 * light-mode colours.
 */
export function launcherTheme(outer: Theme): Theme {
  return createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#1a9fff' },
      background: { default: '#171d25', paper: '#1b2838' },
      text: { primary: '#c7d5e0', secondary: '#8f98a0' },
      divider: 'rgba(199,213,224,0.18)',
    },
    typography: { fontFamily: outer?.typography?.fontFamily ?? 'inherit' },
    shape: { borderRadius: outer?.shape?.borderRadius ?? 4 },
  })
}

/** Frame of the library panel. */
export const shellSx = {
  display: 'flex',
  minHeight: '70vh',
  bgcolor: '#171d25',
  color: '#c7d5e0',
  borderRadius: 1,
  overflow: 'hidden',
} as const
