import type {
  LauncherAsset,
  LauncherRelease,
  ReleaseArch,
  ReleaseOs,
} from './releaseTypes'

import { parseAsset, str, type RawAsset, type RawRelease } from './releaseParse'

export * from './releaseTypes'

const TAG = /^(launcher-)?v\d/i

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
