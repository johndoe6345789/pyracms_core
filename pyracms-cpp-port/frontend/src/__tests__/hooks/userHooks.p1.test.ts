import { renderHook, waitFor } from '@testing-library/react'
import { useUserProfile } from '@/components/users/useUserProfile'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true, default: { get: jest.fn() },
}))
const get = api.get as jest.Mock
beforeEach(() => get.mockReset())

describe('useUserProfile', () => {
  it('maps a full row (array response, snake_case fields)', async () => {
    get.mockResolvedValue({ data: [{ id: 1, username: 'u', email: 'e',
      bio: 'b', location: 'l', avatar_url: '/a', reputation: 5,
      created_at: 'c' }] })
    const { result } = renderHook(() => useUserProfile('u'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toEqual({ id: 1, username: 'u',
      email: 'e', bio: 'b', location: 'l', avatarUrl: '/a',
      reputation: 5, createdAt: 'c' })
  })

  it('fills defaults from a single object with camelCase fields', async () => {
    get.mockResolvedValue({ data: { id: 2, username: 'v',
      avatarUrl: '/x', createdAt: 'd' } })
    const { result } = renderHook(() => useUserProfile('v'))
    await waitFor(() => expect(result.current.user).not.toBeNull())
    expect(result.current.user).toMatchObject({ email: '', bio: '',
      location: '', reputation: 0, avatarUrl: '/x', createdAt: 'd' })
  })

  it('defaults missing avatar and date', async () => {
    get.mockResolvedValue({ data: { id: 3, username: 'w' } })
    const { result } = renderHook(() => useUserProfile('w'))
    await waitFor(() => expect(result.current.user).not.toBeNull())
    expect(result.current.user).toMatchObject(
      { avatarUrl: '', createdAt: '' })
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
})
