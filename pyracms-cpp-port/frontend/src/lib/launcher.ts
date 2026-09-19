import type { Binary } from '@/hooks/useGameDepDetail'

export type OsKey = 'Windows' | 'macOS' | 'Linux' | 'Unknown'

export function detectOs(ua?: string): OsKey {
  const s = ua ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '')
  if (/Windows/i.test(s)) return 'Windows'
  if (/Mac OS X|Macintosh/i.test(s)) return 'macOS'
  if (/Linux|X11/i.test(s) && !/Android/i.test(s)) return 'Linux'
  return 'Unknown'
}

function osMatches(bin: Binary, os: OsKey): boolean {
  const b = bin.os.toLowerCase()
  const map: Record<OsKey, string[]> = {
    Windows: ['windows', 'win'],
    macOS: ['macos', 'mac'],
    Linux: ['linux', 'lin'],
    Unknown: [],
  }
  return map[os].includes(b)
}

/** Best binary for the OS; prefers 64-bit / arm64 builds. */
export function pickBinary(bins: Binary[], os: OsKey): Binary | null {
  const hits = bins.filter((b) => osMatches(b, os) && b.url && b.url !== '#')
  if (hits.length === 0) return null
  const rank = (b: Binary) => (/64/.test(b.arch) ? 0 : 1)
  return [...hits].sort((a, b) => rank(a) - rank(b))[0] ?? null
}

export type DeepLinkKind = 'launch' | 'install'

export function deepLink(
  kind: DeepLinkKind,
  slug: string,
  name: string,
): string {
  return (
    `pyracms://${kind}/${encodeURIComponent(slug)}` +
    `/${encodeURIComponent(name)}`
  )
}

export * from './launcherStore'
export * from './launcherArt'
