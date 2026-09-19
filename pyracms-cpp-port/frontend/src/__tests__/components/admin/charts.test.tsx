import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PageViewChart } from '@/components/admin/charts/PageViewChart'
import { TopContentChart } from '@/components/admin/charts/TopContentChart'
import { TrafficPieChart } from '@/components/admin/charts/TrafficPieChart'
import {
  ReferrersTable,
  SearchesTable,
} from '@/components/admin/analytics/AnalyticsTables'
import { m } from '../../helpers/scopeApi'
import { stubResizeObserver } from '../../helpers/scopeMocks'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)

beforeAll(stubResizeObserver)

beforeEach(() => jest.resetAllMocks())

it('PageViewChart switches ranges', () => {
  render(<PageViewChart />)
  fireEvent.click(screen.getByRole('button', { name: 'Weekly' }))
  fireEvent.click(screen.getByRole('button', { name: 'Weekly' }))
  fireEvent.click(screen.getByRole('button', { name: 'Monthly' }))
  expect(screen.getByText('Page Views')).toBeInTheDocument()
})

it('analytics tables render rows', () => {
  render(
    <>
      <ReferrersTable />
      <SearchesTable />
    </>,
  )
  expect(screen.getByText('Google Search')).toBeInTheDocument()
  expect(screen.getByText('react hooks')).toBeInTheDocument()
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
  await waitFor(() => expect(m.get).toHaveBeenCalledTimes(4))
})

it('TrafficPieChart counts real content, never /api/analytics', async () => {
  m.get.mockResolvedValue({ data: [1, 2] })
  render(<TrafficPieChart tenantId={7} />)
  await waitFor(() => expect(m.get).toHaveBeenCalledTimes(4))
  const urls = m.get.mock.calls.map((c) => c[0] as string)
  expect(urls.some((u) => u.startsWith('/api/analytics?'))).toBe(false)
  expect(urls).toContain('/api/articles?tenant_id=7')
  expect(screen.getByTestId('traffic-pie-chart')).toBeInTheDocument()
})

it('TrafficPieChart makes no request without a tenant', () => {
  render(<TrafficPieChart />)
  expect(m.get).not.toHaveBeenCalled()
})
