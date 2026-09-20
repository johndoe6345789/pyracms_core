import { renderHook, waitFor } from '@testing-library/react'
import { useTagCloud } from '@/hooks/useTagCloud'
import { useTagCloudPage } from '@/hooks/useTagCloudPage'
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

describe('tag cloud hooks', () => {
  it('useTagCloud loads, tolerates errors and null tenant', async () => {
    get.mockResolvedValueOnce({ data: [{ name: 'a', count: 1 }] })
    const ok = renderHook(() => useTagCloud(1))
    await waitFor(() => expect(ok.result.current.tags).toHaveLength(1))
    get.mockRejectedValueOnce(new Error('x'))
    const bad = renderHook(() => useTagCloud(2))
    await waitFor(() => expect(bad.result.current.loading).toBe(false))
    expect(bad.result.current.tags).toEqual([])
    renderHook(() => useTagCloud(null))
    expect(get).toHaveBeenCalledTimes(2)
  })

  it('useTagCloudPage scales tags and links to articles', async () => {
    get.mockImplementation((u: string) =>
      Promise.resolve(
        u.includes('tenants')
          ? { data: { id: 8 } }
          : {
              data: [
                { name: 'big', count: 10 },
                { name: 'sm', count: 5 },
              ],
            },
      ),
    )
    const { result } = renderHook(() => useTagCloudPage())
    await waitFor(() => expect(result.current.items).toHaveLength(2))
    expect(result.current.items[0]).toMatchObject({
      weight: 1,
      fontSize: 40,
      height: 40,
      href: '/site/demo/articles?tag=big',
    })
    expect(result.current.items[1]!.fontSize).toBe(27.5)
  })
})
