import type { LauncherAsset, ReleaseArch, ReleaseOs } from './releaseTypes'

const NAME = /^hypernucleus-(win|mac|lin)-(x86_64|arm64)(\.[\w.]+)?$/i

export interface RawAsset {
  name?: unknown
  size?: unknown
  digest?: unknown
  browser_download_url?: unknown
}
export interface RawRelease {
  tag_name?: unknown
  name?: unknown
  html_url?: unknown
  published_at?: unknown
  draft?: unknown
  prerelease?: unknown
  assets?: unknown
}

export const str = (v: unknown) => (typeof v === 'string' ? v : '')

export function parseAsset(a: RawAsset): LauncherAsset | null {
  const m = NAME.exec(str(a.name))
  const url = str(a.browser_download_url)
  if (!m || !url.startsWith('https://')) return null
  const dg = /^sha256:([0-9a-f]{64})$/i.exec(str(a.digest))
  return {
    name: str(a.name),
    os: (m[1] as string).toLowerCase() as ReleaseOs,
    arch: (m[2] as string).toLowerCase() as ReleaseArch,
    size: typeof a.size === 'number' ? a.size : 0,
    url,
    sha256: dg ? (dg[1] as string).toLowerCase() : undefined,
  }
}
