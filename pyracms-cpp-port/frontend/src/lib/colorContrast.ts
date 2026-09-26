/** Contrast between two colours as browsers judge legibility (WCAG). */

function channels(hex: string): [number, number, number] | null {
  let h = hex.trim().replace('#', '')
  if (h.length === 3) h = [...h].map((c) => c + c).join('')
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(h)) return null
  const n = parseInt(h.slice(0, 6), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function luminance(hex: string): number | null {
  const c = channels(hex)
  if (!c) return null
  const [r, g, b] = c.map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** 1 (identical) to 21 (black on white); null if a colour is not a hex. */
export function contrastRatio(a: string, b: string): number | null {
  const la = luminance(a)
  const lb = luminance(b)
  if (la === null || lb === null) return null
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

export type ContrastGrade = 'AAA' | 'AA' | 'Large text only' | 'Too low'

/** WCAG level for body text at this ratio. */
export function contrastGrade(ratio: number): ContrastGrade {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'Large text only'
  return 'Too low'
}

/** "#abc" -> "#aabbcc", lower case; null when it is not a colour. */
export function normalizeHex(input: string): string | null {
  const c = channels(input)
  if (!c) return null
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

/** A surface a touch lighter than the page (cards, menus) for dark looks. */
export function lift(hex: string): string {
  const n = parseInt(hex.replace('#', '').slice(0, 6).padEnd(6, '0'), 16)
  const up = (c: number) => Math.min(255, c + 22)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(up)
  return `#${[r, g, b].map((c) => c!.toString(16).padStart(2, '0')).join('')}`
}
