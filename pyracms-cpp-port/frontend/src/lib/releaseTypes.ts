export type ReleaseOs = 'win' | 'mac' | 'lin'
export type ReleaseArch = 'x86_64' | 'arm64'

export interface LauncherAsset {
  name: string
  os: ReleaseOs
  arch: ReleaseArch
  size: number
  url: string
  /** Hex SHA-256, when GitHub reports a digest */
  sha256?: string | undefined
}

export interface LauncherRelease {
  tag: string
  name: string
  url: string
  publishedAt: string
  prerelease: boolean
  assets: LauncherAsset[]
  /** Link to SHA256SUMS when the release ships one */
  sumsUrl?: string | undefined
}

export const OS_LABEL: Record<ReleaseOs, string> = {
  win: 'Windows',
  mac: 'macOS',
  lin: 'Linux',
}
export const ARCH_LABEL: Record<ReleaseArch, string> = {
  x86_64: 'x86_64',
  arm64: 'ARM64',
}
