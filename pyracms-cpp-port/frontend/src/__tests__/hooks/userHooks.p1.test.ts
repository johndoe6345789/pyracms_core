import { renderHook, waitFor } from '@testing-library/react'
import {
  useUserProfile, mapProfile,
} from '@/components/users/useUserProfile'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true, default: { get: jest.fn() },
}))
const get = api.get as jest.Mock
beforeEach(() => get.mockReset())

const routes = (r: Record<string, unknown>) =>
  get.mockImplementation((url: string) => {
    const hit = Object.keys(r).find((k) => url.startsWith(k))
    return hit && r[hit] !== 'fail'
      ? Promise.resolve({ data: r[hit] }) : Promise.reject(new Error('x'))
  })

describe('useUserProfile', () => {
  it('merges the list row, full record and reputation', async () => {
    routes({
      '/api/users?username=u': [{ id: 1, username: 'u',
        createdAt: '2024-01-02T00:00:00' }],
      '/api/users/1/reputation': { total: 5, postCount: 3 },
      '/api/users/1': { aboutme: 'hi', website: 'http://w' },
    })
    const { result } = renderHook(() => useUserProfile('u'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toEqual({ id: 1, username: 'u',
      email: '', bio: 'hi', website: 'http://w', avatarUrl: '',
      reputation: 5, postCount: 3, createdAt: '2024-01-02T00:00:00' })
  })

  it('still shows the user when the extra calls fail', async () => {
    routes({
      '/api/users?username=v': [{ id: 2, username: 'v' }],
      '/api/users/2/reputation': 'fail', '/api/users/2': 'fail',
    })
    const { result } = renderHook(() => useUserProfile('v'))
    await waitFor(() => expect(result.current.user).not.toBeNull())
    expect(result.current.user).toMatchObject(
      { bio: '', reputation: 0, postCount: 0, createdAt: '' })
  })

  it('leaves user null when nothing matches or the call fails', async () => {
    get.mockResolvedValueOnce({ data: [] })
    const a = renderHook(() => useUserProfile('x'))
    await waitFor(() => expect(a.result.current.loading).toBe(false))
    expect(a.result.current.user).toBeNull()
    get.mockRejectedValueOnce(new Error('x'))
    const b = renderHook(() => useUserProfile('y'))
    await waitFor(() => expect(b.result.current.loading).toBe(false))
    expect(b.result.current.user).toBeNull()
  })

  it('mapProfile ignores wrongly typed fields', () => {
    expect(mapProfile({ id: 'a', username: 3 }, {}, { total: 'x' }))
      .toMatchObject({ id: 0, username: '', reputation: 0 })
  })
})
