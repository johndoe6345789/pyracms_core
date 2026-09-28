const pad = (n: number) => String(n).padStart(2, '0')

/** Seconds as m:ss, or h:mm:ss from an hour up. */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`
}

const UNITS: [number, string][] = [
  [1e9, 'B'],
  [1e6, 'M'],
  [1e3, 'K'],
]

/** 950, 1.2K, 34K, 5.6M: one decimal below ten, truncated like YouTube. */
export function compactCount(n: number): string {
  const v = Math.max(0, Math.floor(n || 0))
  for (const [size, unit] of UNITS) {
    if (v < size) continue
    const x = v / size
    return `${x < 10 ? Math.floor(x * 10) / 10 : Math.floor(x)}${unit}`
  }
  return String(v)
}

export function formatViews(n: number): string {
  return `${compactCount(n)} ${n === 1 ? 'view' : 'views'}`
}
