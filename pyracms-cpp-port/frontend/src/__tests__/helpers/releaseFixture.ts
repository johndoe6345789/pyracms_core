const dl = (n: string) =>
  `https://github.com/o/r/releases/download/launcher-v1.2.0/${n}`
const HASH = 'a'.repeat(64)

export const asset = (name: string, extra: object = {}) => ({
  name, size: 5 * 1024 * 1024, browser_download_url: dl(name), ...extra,
})

export const RAW_RELEASES = [
  { tag_name: 'v0.9.0', name: 'Old', html_url: 'u0', draft: false,
    published_at: '2025-01-01T00:00:00Z', assets: [] },
  { tag_name: 'launcher-v1.2.0', name: 'Launcher 1.2', html_url: 'u1',
    draft: false, prerelease: false, published_at: '2025-03-01T00:00:00Z',
    assets: [
      asset('hypernucleus-win-x86_64.exe', { digest: `sha256:${HASH}` }),
      asset('hypernucleus-mac-arm64.zip'),
      asset('hypernucleus-lin-x86_64'),
      asset('SHA256SUMS'),
      asset('notes.txt'),
    ] },
  { tag_name: 'launcher-v2.0.0', draft: true, published_at: '2025-04-01' },
  { tag_name: 'nightly', draft: false, published_at: '2025-05-01' },
]
