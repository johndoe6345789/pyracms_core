import {
  fetchTopContent, mapArticles,
} from '@/components/admin/charts/topContentFetcher'
import {
  fetchFallback,
} from '@/components/admin/charts/trafficFetcher'
import { renderLabel } from '@/components/admin/charts/trafficLabel'
import { m } from '../../helpers/scopeApi'
import { stubResizeObserver } from '../../helpers/scopeMocks'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)

beforeAll(stubResizeObserver)

beforeEach(() => jest.resetAllMocks())

it('fetchTopContent maps, rejects non-arrays, falls back', async () => {
  m.get.mockResolvedValueOnce({ data: [{ title: 'T', views: 4 },
    { name: 'N', viewCount: 2 }, {}] })
  expect(await fetchTopContent(1)).toEqual([
    { name: 'T', views: 4 }, { name: 'N', views: 2 },
    { name: '', views: 0 }])
  m.get.mockResolvedValueOnce({ data: {} })
  expect(await fetchTopContent(1)).toBeNull()
  m.get.mockRejectedValueOnce(new Error('x'))
  m.get.mockResolvedValueOnce({ data: [{ displayName: 'a', viewCount: 1 },
    { viewCount: 'z' }] })
  expect((await fetchTopContent(1))![0]!.name).toBe('a')
  m.get.mockRejectedValueOnce(new Error('x'))
  m.get.mockResolvedValueOnce({ data: null })
  expect(await fetchTopContent(1)).toEqual([])
  expect(mapArticles(Array.from({ length: 10 }, () => ({})))).toHaveLength(8)
})

it('traffic helpers compute values', async () => {
  expect(renderLabel({ name: 'A', percent: 0.256 })).toBe('A 26%')
  m.get.mockImplementation((url: string) => {
    if (url.includes('forum')) {
      return Promise.resolve({ data: [{ forums: [{ totalPosts: 2 }, {}] },
        {}] })
    }
    if (url.includes('gallery')) {
      return Promise.resolve({ data: [{ pictureCount: 3 }, {}] })
    }
    if (url.includes('snippets')) {
      return Promise.resolve({ data: { items: [1, 2] } })
    }
    return Promise.resolve({ data: [1] })
  })
  const r = await fetchFallback(1)
  expect(r.map((x) => x.value)).toEqual([1, 2, 2, 3])
  m.get.mockRejectedValue(new Error('x'))
  expect((await fetchFallback(1)).map((x) => x.value)).toEqual([0, 0, 0, 0])
  m.get.mockResolvedValue({ data: null })
  expect((await fetchFallback(1)).map((x) => x.value)).toEqual([0, 0, 0, 0])
})
