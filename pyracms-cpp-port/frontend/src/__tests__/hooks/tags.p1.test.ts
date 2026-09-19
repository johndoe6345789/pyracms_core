import { renderHook, waitFor } from '@testing-library/react'
import { useTenantId } from '@/hooks/useTenantId'
import { useTenantList } from '@/hooks/useTenantList'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'demo' }),
}))
const get = api.get as jest.Mock
beforeEach(() => get.mockReset())

describe('tenant hooks', () => {
  it('useTenantId fetches once then serves from cache', async () => {
    get.mockResolvedValue({ data: { id: 42 } })
    const a = renderHook(() => useTenantId('cached'))
    await waitFor(() => expect(a.result.current.tenantId).toBe(42))
    const b = renderHook(() => useTenantId('cached'))
    expect(b.result.current.tenantId).toBe(42)
    expect(get).toHaveBeenCalledTimes(1)
  })

  it('useTenantId re-reads cache on slug change', async () => {
    get.mockResolvedValue({ data: { id: 3 } })
    const { result, rerender } = renderHook(({ s }) => useTenantId(s), {
      initialProps: { s: 'one' },
    })
    await waitFor(() => expect(result.current.tenantId).toBe(3))
    rerender({ s: '' })
    rerender({ s: 'one' })
    expect(result.current.tenantId).toBe(3)
  })

  it('useTenantId tolerates errors', async () => {
    get.mockRejectedValue(new Error('x'))
    const { result } = renderHook(() => useTenantId('bad'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.tenantId).toBeNull()
  })

  it('useTenantList maps sites', async () => {
    get.mockResolvedValue({
      data: [
        { slug: 'a', displayName: 'A', description: 'd', ownerUsername: 'bob' },
        {},
      ],
    })
    const { result } = renderHook(() => useTenantList())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.sites[0]).toMatchObject({ owner: 'bob' })
    expect(result.current.sites[1]).toMatchObject({ slug: '', owner: 'admin' })
  })

  it('useTenantList tolerates errors', async () => {
    get.mockRejectedValue(new Error('x'))
    const { result } = renderHook(() => useTenantList())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.sites).toEqual([])
  })
})
