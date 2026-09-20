import { renderHook, waitFor } from '@testing-library/react'
import { useArticles } from '@/hooks/useArticles'

const get = jest.fn()
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: (...a: unknown[]) => get(...a) },
}))

beforeEach(() => {
  jest.clearAllMocks()
  get.mockResolvedValue({ data: [] })
})

describe('useArticles', () => {
  it('lists everything without a tag', async () => {
    renderHook(() => useArticles(4))
    await waitFor(() => expect(get).toHaveBeenCalled())
    expect(get).toHaveBeenCalledWith('/api/articles?tenant_id=4')
  })

  it('asks for the tag, encoded, when one is given', async () => {
    renderHook(() => useArticles(4, 'c++ & more'))
    await waitFor(() => expect(get).toHaveBeenCalled())
    expect(get).toHaveBeenCalledWith(
      '/api/articles?tenant_id=4&tag=c%2B%2B%20%26%20more',
    )
  })

  it('reloads when the tag changes', async () => {
    const { rerender } = renderHook(({ t }) => useArticles(4, t), {
      initialProps: { t: 'a' },
    })
    await waitFor(() => expect(get).toHaveBeenCalledTimes(1))
    rerender({ t: 'b' })
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2))
    expect(get).toHaveBeenLastCalledWith('/api/articles?tenant_id=4&tag=b')
  })
})
