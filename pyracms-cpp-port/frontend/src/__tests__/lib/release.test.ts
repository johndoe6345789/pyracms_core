import {
  pickRelease, pickAsset, formatSize,
} from '@/lib/release'
import { RAW_RELEASES } from '../helpers/releaseFixture'

describe('pickRelease', () => {
  const rel = pickRelease(RAW_RELEASES)

  it('takes the newest non-draft launcher/v tag', () => {
    expect(rel?.tag).toBe('launcher-v1.2.0')
    expect(rel?.name).toBe('Launcher 1.2')
  })

  it('keeps only hypernucleus assets and reads digests', () => {
    expect(rel?.assets.map((a) => `${a.os}-${a.arch}`))
      .toEqual(['win-x86_64', 'mac-arm64', 'lin-x86_64'])
    expect(rel?.assets[0]?.sha256).toBe('a'.repeat(64))
    expect(rel?.assets[1]?.sha256).toBeUndefined()
    expect(rel?.sumsUrl).toMatch(/SHA256SUMS$/)
  })

  it('prefers stable over a newer pre-release', () => {
    const rc = { tag_name: 'v3.0.0-rc1', prerelease: true,
      published_at: '2026-01-01', assets: [] }
    expect(pickRelease([...RAW_RELEASES, rc])?.tag).toBe('launcher-v1.2.0')
    expect(pickRelease([rc])?.prerelease).toBe(true)
  })

  it('returns null for junk or nothing suitable', () => {
    expect(pickRelease(null)).toBeNull()
    expect(pickRelease([])).toBeNull()
    expect(pickRelease([{ tag_name: 'nightly' }])).toBeNull()
  })

  it('rejects non-https assets', () => {
    const r = pickRelease([{ tag_name: 'v1', assets: [{
      name: 'hypernucleus-lin-arm64', browser_download_url: 'http://x' }] }])
    expect(r?.assets).toEqual([])
    expect(r?.name).toBe('v1')
  })
})

describe('pickAsset / formatSize', () => {
  const assets = pickRelease(RAW_RELEASES)!.assets
  it('matches exactly, then by OS, else null', () => {
    expect(pickAsset(assets, 'mac', 'arm64')?.name).toContain('mac-arm64')
    expect(pickAsset(assets, 'mac', 'x86_64')?.name).toContain('mac-arm64')
    expect(pickAsset(assets, null, 'arm64')).toBeNull()
    expect(pickAsset([], 'win', 'arm64')).toBeNull()
  })
  it('formats sizes', () => {
    expect(formatSize(0)).toBe('-')
    expect(formatSize(2048)).toBe('2 KB')
    expect(formatSize(5 * 1024 * 1024)).toBe('5.0 MB')
  })
})
