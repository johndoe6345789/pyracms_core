import { fetchLatestRelease, resetReleaseCache } from '@/lib/releaseFetch'
import { RAW_RELEASES } from '../helpers/releaseFixture'

const ok = (body: unknown) => ({ ok: true, json: async () => body }) as Response

describe('fetchLatestRelease', () => {
  const f = jest.fn()
  beforeEach(() => {
    f.mockReset()
    global.fetch = f
    resetReleaseCache()
    window.sessionStorage.clear()
  })

  it('calls the GitHub API and caches in memory', async () => {
    f.mockResolvedValue(ok(RAW_RELEASES))
    const a = await fetchLatestRelease()
    await fetchLatestRelease()
    expect(a?.tag).toBe('launcher-v1.2.0')
    expect(f).toHaveBeenCalledTimes(1)
    expect(f.mock.calls[0][0]).toContain('api.github.com/repos/')
  })

  it('reuses sessionStorage after a reload', async () => {
    f.mockResolvedValue(ok(RAW_RELEASES))
    await fetchLatestRelease()
    resetReleaseCache()
    expect((await fetchLatestRelease())?.tag).toBe('launcher-v1.2.0')
    expect(f).toHaveBeenCalledTimes(1)
  })

  it('refetches once the cache is stale', async () => {
    f.mockResolvedValue(ok(RAW_RELEASES))
    const now = jest.spyOn(Date, 'now')
    now.mockReturnValue(1000)
    await fetchLatestRelease()
    now.mockReturnValue(1000 + 11 * 60 * 1000)
    await fetchLatestRelease()
    expect(f).toHaveBeenCalledTimes(2)
    now.mockRestore()
  })

  it('resolves null on rate limit / network error, uncached', async () => {
    f.mockResolvedValueOnce({ ok: false, status: 403 })
    expect(await fetchLatestRelease()).toBeNull()
    f.mockRejectedValueOnce(new Error('offline'))
    expect(await fetchLatestRelease()).toBeNull()
    f.mockResolvedValueOnce(ok(RAW_RELEASES))
    expect((await fetchLatestRelease())?.tag).toBe('launcher-v1.2.0')
  })

  it('survives broken sessionStorage', async () => {
    window.sessionStorage.setItem('pyracms.launcherRelease.v1', '{bad')
    f.mockResolvedValue(ok([]))
    expect(await fetchLatestRelease()).toBeNull()
    const set = jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('quota')
      })
    resetReleaseCache()
    window.sessionStorage.clear()
    f.mockResolvedValue(ok(RAW_RELEASES))
    expect((await fetchLatestRelease())?.tag).toBe('launcher-v1.2.0')
    set.mockRestore()
  })
})
