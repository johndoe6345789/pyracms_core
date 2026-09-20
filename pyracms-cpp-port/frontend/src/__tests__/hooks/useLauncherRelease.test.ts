import { renderHook, waitFor } from '@testing-library/react'
import { useLauncherRelease, usePlatform } from '@/hooks/useLauncherRelease'
import { fetchLatestRelease } from '@/lib/releaseFetch'
import { pickRelease } from '@/lib/release'
import { RAW_RELEASES } from '../helpers/releaseFixture'

jest.mock('@/lib/releaseFetch', () => ({ fetchLatestRelease: jest.fn() }))
const fetchMock = fetchLatestRelease as jest.Mock

describe('useLauncherRelease', () => {
  it('goes loading -> ready', async () => {
    fetchMock.mockResolvedValue(pickRelease(RAW_RELEASES))
    const { result } = renderHook(() => useLauncherRelease())
    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('ready'))
  })

  it('goes to fallback when there is no release', async () => {
    fetchMock.mockResolvedValue(null)
    const { result } = renderHook(() => useLauncherRelease())
    await waitFor(() => expect(result.current.status).toBe('fallback'))
  })

  it('ignores a late answer after unmount', async () => {
    let done: (v: null) => void = () => {}
    fetchMock.mockReturnValue(
      new Promise((r) => {
        done = r
      }),
    )
    const { unmount, result } = renderHook(() => useLauncherRelease())
    unmount()
    done(null)
    expect(result.current.status).toBe('loading')
  })
})

describe('usePlatform', () => {
  // jsdom reports the host OS in its user agent, so pin it: the test must
  // not depend on which machine runs it.
  it('detects the platform from the user agent asynchronously', async () => {
    const ua = jest
      .spyOn(window.navigator, 'userAgent', 'get')
      .mockReturnValue('Mozilla/5.0 (X11; Linux x86_64) Chrome/120 Safari/537')
    const { result } = renderHook(() => usePlatform())
    await waitFor(() => expect(result.current.arch).toBeTruthy())
    expect(result.current.os).toBe('lin')
    ua.mockRestore()
  })
})
