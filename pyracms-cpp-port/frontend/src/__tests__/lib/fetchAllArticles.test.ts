import { fetchAllArticles } from '@/lib/fetchAllArticles'

const get = jest.fn()
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: (...a: unknown[]) => get(...a) },
}))

const rows = (n: number, from = 0) =>
  Array.from({ length: n }, (_, i) => ({ name: `a${from + i}` }))

beforeEach(() => get.mockReset())

describe('fetchAllArticles', () => {
  it('keeps reading pages until one comes back short', async () => {
    get
      .mockResolvedValueOnce({ data: rows(100) })
      .mockResolvedValueOnce({ data: rows(100, 100) })
      .mockResolvedValueOnce({ data: rows(7, 200) })
    const all = await fetchAllArticles(4)
    expect(all).toHaveLength(207)
    expect(get).toHaveBeenCalledTimes(3)
    expect(get).toHaveBeenNthCalledWith(
      2,
      '/api/articles?tenant_id=4&limit=100&offset=100',
    )
    expect(get).toHaveBeenNthCalledWith(
      3,
      '/api/articles?tenant_id=4&limit=100&offset=200',
    )
  })

  it('stops after one request on a site under one page', async () => {
    get.mockResolvedValueOnce({ data: rows(32) })
    expect(await fetchAllArticles(4)).toHaveLength(32)
    expect(get).toHaveBeenCalledTimes(1)
  })

  it('passes the tag and tolerates a non-list answer', async () => {
    get.mockResolvedValueOnce({ data: { error: 'x' } })
    expect(await fetchAllArticles(4, 'c++')).toEqual([])
    expect(get).toHaveBeenCalledWith(
      '/api/articles?tenant_id=4&limit=100&offset=0&tag=c%2B%2B',
    )
  })

  it('stops at the safety limit instead of looping forever', async () => {
    get.mockResolvedValue({ data: rows(100) })
    const all = await fetchAllArticles(4)
    expect(get).toHaveBeenCalledTimes(30)
    expect(all).toHaveLength(3000)
  })
})
