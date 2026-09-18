import { renderHook, waitFor } from '@testing-library/react'
import { useTenant, titleFromSlug } from '@/hooks/useTenant'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true, default: { get: jest.fn() },
}))
const get = api.get as jest.Mock

describe('titleFromSlug', () => {
  it('title-cases a slug', () => {
    expect(titleFromSlug('my-cool-site')).toBe('My Cool Site')
  })
})

describe('useTenant', () => {
  beforeEach(() => get.mockReset())

  it('loads and caches a site', async () => {
    get.mockResolvedValue({ data: { id: 1, slug: 'a', ownerId: 2 } })
    const { result } = renderHook(() => useTenant('a'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.tenant?.displayName).toBe('A')
    expect(result.current.tenant?.description).toBe('')
    const again = renderHook(() => useTenant('a'))
    expect(again.result.current.tenant?.id).toBe(1)
    expect(get).toHaveBeenCalledTimes(1)
  })

  it('flags 404 as not found', async () => {
    get.mockRejectedValue({ response: { status: 404 } })
    const { result } = renderHook(() => useTenant('gone'))
    await waitFor(() => expect(result.current.notFound).toBe(true))
  })

  it('ignores other errors and empty slugs', async () => {
    get.mockRejectedValue(new Error('net'))
    const { result } = renderHook(() => useTenant('flaky'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.notFound).toBe(false)
    renderHook(() => useTenant(''))
    expect(get).toHaveBeenCalledTimes(1)
  })
})
