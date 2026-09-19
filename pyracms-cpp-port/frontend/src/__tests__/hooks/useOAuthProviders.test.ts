import { renderHook, waitFor } from '@testing-library/react'
import { useOAuthProviders } from '@/hooks/useOAuthProviders'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true, default: { get: jest.fn() },
}))
const get = api.get as jest.Mock

describe('useOAuthProviders', () => {
  it('keeps only providers whose url endpoint answers', async () => {
    get.mockImplementation((u: string) => u.includes('github')
      ? Promise.resolve({ data: { url: 'https://x' } })
      : Promise.reject(new Error('400')))
    const { result } = renderHook(() => useOAuthProviders())
    await waitFor(() => expect(result.current.loaded).toBe(true))
    expect(result.current.providers.map((p) => p.id)).toEqual(['github'])
  })
  it('is empty when everything errors', async () => {
    get.mockRejectedValue(new Error('x'))
    const { result } = renderHook(() => useOAuthProviders())
    await waitFor(() => expect(result.current.loaded).toBe(true))
    expect(result.current.providers).toEqual([])
  })
})
