export interface ThemeConfig {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  borderRadius: number
  spacing: number
}

export const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#1976d2',
  secondaryColor: '#9c27b0',
  backgroundColor: '#ffffff',
  textColor: '#212121',
  fontFamily: 'Roboto, sans-serif',
  borderRadius: 8,
  spacing: 8,
}

export const FONTS = [
  'Roboto, sans-serif',
  'Inter, sans-serif',
  'Open Sans, sans-serif',
  'Lato, sans-serif',
  'Montserrat, sans-serif',
  'Source Sans Pro, sans-serif',
  'Georgia, serif',
  'Merriweather, serif',
  'Fira Code, monospace',
]

export function exportTheme(theme: ThemeConfig) {
  const blob = new Blob([JSON.stringify(theme, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'theme.json'
  a.click()
  URL.revokeObjectURL(url)
}

const MAX_IMPORT_BYTES = 1024 * 1024

/** Keeps only known theme keys with string values (no proto keys). */
export function pickTheme(imported: unknown): ThemeConfig {
  const out: Record<string, unknown> = { ...DEFAULT_THEME }
  if (imported && typeof imported === 'object') {
    for (const k of Object.keys(DEFAULT_THEME)) {
      const v = (imported as Record<string, unknown>)[k]
      if (typeof v === typeof (DEFAULT_THEME as never)[k]) out[k] = v
    }
  }
  return out as unknown as ThemeConfig
}

export function importTheme(apply: (t: ThemeConfig) => void) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file || file.size > MAX_IMPORT_BYTES) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string)
        apply(pickTheme(imported))
      } catch {
        console.error('Invalid theme JSON')
      }
    }
    reader.readAsText(file)
  }
  input.click()
}
