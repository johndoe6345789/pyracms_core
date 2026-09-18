import type { Binary } from '@/hooks/useGameDepDetail'

export type OsKey = 'Windows' | 'macOS' | 'Linux' | 'Unknown'

export function detectOs(ua?: string): OsKey {
  const s = (ua ??
    (typeof navigator !== 'undefined' ? navigator.userAgent : ''))
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
  const rank = (b: Binary) => /64/.test(b.arch) ? 0 : 1
  return [...hits].sort((a, b) => rank(a) - rank(b))[0] ?? null
}

export type DeepLinkKind = 'launch' | 'install'

export function deepLink(
  kind: DeepLinkKind, slug: string, name: string,
): string {
  return `pyracms://${kind}/${encodeURIComponent(slug)}` +
    `/${encodeURIComponent(name)}`
}

const INSTALLED_KEY = 'pyracms.launcher.installed'
const FAV_KEY = 'pyracms.launcher.favourites'

function read(key: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch {
    return {}
  }
}

function write(key: string, v: Record<string, string>) {
  try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* ignore */ }
}

/** Per-browser convenience only; not a real install record. */
export const installedStore = {
  get: () => read(INSTALLED_KEY),
  set: (name: string, version: string) =>
    write(INSTALLED_KEY, { ...read(INSTALLED_KEY), [name]: version }),
  remove: (name: string) => {
    const cur = read(INSTALLED_KEY)
    delete cur[name]
    write(INSTALLED_KEY, cur)
  },
}

export const favouriteStore = {
  get: () => read(FAV_KEY),
  toggle: (name: string): Record<string, string> => {
    const cur = read(FAV_KEY)
    if (cur[name]) delete cur[name]
    else cur[name] = '1'
    write(FAV_KEY, cur)
    return cur
  },
}

export function initialOf(name: string): string {
  return (name.trim()[0] ?? '?').toUpperCase()
}

export function gradientFor(name: string): string {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360
  return `linear-gradient(135deg, hsl(${h} 55% 28%), ` +
    `hsl(${(h + 50) % 360} 60% 14%))`
}
