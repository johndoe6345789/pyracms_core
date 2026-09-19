import type {
  LauncherAsset,
  LauncherRelease,
  ReleaseArch,
  ReleaseOs,
} from './releaseTypes'

export * from './releaseTypes'

const NAME = /^hypernucleus-(win|mac|lin)-(x86_64|arm64)(\.[\w.]+)?$/i
const TAG = /^(launcher-)?v\d/i

interface RawAsset {
  name?: unknown
  size?: unknown
  digest?: unknown
  browser_download_url?: unknown
}
interface RawRelease {
  tag_name?: unknown
  name?: unknown
  html_url?: unknown
  published_at?: unknown
  draft?: unknown
  prerelease?: unknown
  assets?: unknown
}

const str = (v: unknown) => (typeof v === 'string' ? v : '')

function parseAsset(a: RawAsset): LauncherAsset | null {
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

/** Newest non-draft launcher release (stable preferred over pre-release). */
export function pickRelease(list: unknown): LauncherRelease | null {
  if (!Array.isArray(list)) return null
  const rels = (list as RawRelease[])
    .filter((r) => r && !r.draft && TAG.test(str(r.tag_name)))
    .sort(
      (a, b) =>
        Number(!!a.prerelease) - Number(!!b.prerelease) ||
        str(b.published_at).localeCompare(str(a.published_at)),
    )
  const r = rels[0]
  if (!r) return null
  const raw = Array.isArray(r.assets) ? (r.assets as RawAsset[]) : []
  const sums = raw.find((a) => str(a.name) === 'SHA256SUMS')
  return {
    tag: str(r.tag_name),
    name: str(r.name) || str(r.tag_name),
    url: str(r.html_url),
    publishedAt: str(r.published_at),
    prerelease: !!r.prerelease,
    assets: raw.map(parseAsset).filter((a): a is LauncherAsset => !!a),
    sumsUrl: sums ? str(sums.browser_download_url) || undefined : undefined,
  }
}

export function formatSize(bytes: number): string {
  if (!bytes) return '-'
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`
}

/** Best asset for the visitor: exact match, else same OS. */
export function pickAsset(
  assets: LauncherAsset[],
  os: ReleaseOs | null,
  arch: ReleaseArch,
): LauncherAsset | null {
  if (!os) return null
  return (
    assets.find((a) => a.os === os && a.arch === arch) ??
    assets.find((a) => a.os === os) ??
    null
  )
}
