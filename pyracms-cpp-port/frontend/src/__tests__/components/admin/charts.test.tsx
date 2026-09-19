import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PageViewChart } from '@/components/admin/charts/PageViewChart'
import { TopContentChart } from '@/components/admin/charts/TopContentChart'
import { TrafficPieChart } from '@/components/admin/charts/TrafficPieChart'
import {
  fetchTopContent, mapArticles,
} from '@/components/admin/charts/topContentFetcher'
import {
  mapTraffic, fetchFallback,
} from '@/components/admin/charts/trafficFetcher'
import { renderLabel } from '@/components/admin/charts/trafficLabel'
import {
  ReferrersTable, SearchesTable,
} from '@/components/admin/analytics/AnalyticsTables'
import { m } from '../../helpers/scopeApi'
import { stubResizeObserver } from '../../helpers/scopeMocks'

beforeAll(stubResizeObserver)

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)

beforeEach(() => jest.resetAllMocks())

it('PageViewChart switches ranges', () => {
  render(<PageViewChart />)
  fireEvent.click(screen.getByRole('button', { name: 'Weekly' }))
  fireEvent.click(screen.getByRole('button', { name: 'Weekly' }))
  fireEvent.click(screen.getByRole('button', { name: 'Monthly' }))
  expect(screen.getByText('Page Views')).toBeInTheDocument()
})

it('analytics tables render rows', () => {
  render(<><ReferrersTable /><SearchesTable /></>)
  expect(screen.getByText('Google Search')).toBeInTheDocument()
  expect(screen.getByText('react hooks')).toBeInTheDocument()
})

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

it('TopContentChart loads when tenant given', async () => {
  m.get.mockResolvedValue({ data: [{ title: 'T', views: 1 }] })
  const { rerender } = render(<TopContentChart tenantId={null} />)
  expect(m.get).not.toHaveBeenCalled()
  rerender(<TopContentChart tenantId={1} />)
  await waitFor(() => expect(m.get).toHaveBeenCalled())
  m.get.mockResolvedValue({ data: {} })
  rerender(<TopContentChart tenantId={2} />)
  m.get.mockRejectedValue(new Error('x'))
  rerender(<TopContentChart tenantId={3} />)
  await waitFor(() => expect(m.get).toHaveBeenCalledTimes(5))
})

it('TrafficPieChart loads and falls back', async () => {
  m.get.mockResolvedValue({ data: { traffic: [{ name: 'Forum', count: 2 },
    { name: 'Zed', value: 1 }] } })
  const { rerender } = render(<TrafficPieChart tenantId={1} />)
  await waitFor(() => expect(m.get).toHaveBeenCalled())
  m.get.mockResolvedValue({ data: {} })
  rerender(<TrafficPieChart tenantId={2} />)
  m.get.mockRejectedValue(new Error('x'))
  rerender(<TrafficPieChart tenantId={3} />)
  await waitFor(() => expect(m.get.mock.calls.length).toBeGreaterThan(6))
  rerender(<TrafficPieChart />)
  expect(screen.getByTestId('traffic-pie-chart')).toBeInTheDocument()
})

it('traffic helpers compute values', async () => {
  expect(mapTraffic([{ name: 'Zed', value: 3 }])[0]!.color).toBe('#757575')
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
