import type { ThemeOptions } from '@mui/material/styles'

const phone = '@media (max-width:600px)'

/** Headings shrink on phones so a site name or title never overflows. */
const headings = {
  h1: '2.25rem',
  h2: '2rem',
  h3: '1.75rem',
  h4: '1.5rem',
  h5: '1.25rem',
}

/**
 * Phone-friendly additions to a theme: smaller headings, words that wrap
 * instead of pushing the page wider, and media that never exceeds the screen.
 */
export function withMobile(options: ThemeOptions): ThemeOptions {
  const typography = { ...(options.typography as Record<string, object>) }
  for (const [tag, size] of Object.entries(headings)) {
    typography[tag] = { ...typography[tag], [phone]: { fontSize: size } }
  }
  return {
    ...options,
    typography,
    components: {
      ...options.components,
      MuiCssBaseline: {
        styleOverrides: {
          html: { WebkitTextSizeAdjust: '100%' },
          body: { overflowWrap: 'break-word' },
          'img, video, iframe, svg': { maxWidth: '100%' },
          pre: { maxWidth: '100%', overflowX: 'auto' },
        },
      },
    },
  }
}
