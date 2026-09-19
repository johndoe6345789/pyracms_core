import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PageViewChart } from '@/components/admin/charts/PageViewChart'
import { TopContentChart } from '@/components/admin/charts/TopContentChart'
import { TrafficPieChart } from '@/components/admin/charts/TrafficPieChart'
import {
  ReferrersTable, SearchesTable,
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
  render(<><ReferrersTable /><SearchesTable /></>)
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
