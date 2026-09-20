import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PageViewChart } from '@/components/admin/charts/PageViewChart'
import {
  ReferrersTable,
  SearchesTable,
} from '@/components/admin/analytics/AnalyticsTables'
import { m } from '../../helpers/scopeApi'
import { stubResizeObserver } from '../../helpers/scopeMocks'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

beforeAll(stubResizeObserver)
beforeEach(() => jest.resetAllMocks())

const urls = () => m.get.mock.calls.map((c) => c[0] as string)

describe('PageViewChart', () => {
  it('asks for nothing without a site, and invents nothing', () => {
    render(<PageViewChart />)
    expect(m.get).not.toHaveBeenCalled()
    expect(screen.getByTestId('page-views-empty')).toBeInTheDocument()
  })

  it('loads the real views and reloads for each period', async () => {
    m.get.mockResolvedValue({ data: [{ date: '2026-09-20', count: 3 }] })
    render(<PageViewChart tenantId={5} />)
    await waitFor(() =>
      expect(urls()).toContain(
        '/api/analytics/page-views?period=day&tenant_id=5',
      ),
    )
    await waitFor(() =>
      expect(screen.queryByTestId('page-views-empty')).toBeNull(),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Weekly' }))
    await waitFor(() =>
      expect(urls()).toContain(
        '/api/analytics/page-views?period=week&tenant_id=5',
      ),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Monthly' }))
    await waitFor(() =>
      expect(urls()).toContain(
        '/api/analytics/page-views?period=month&tenant_id=5',
      ),
    )
  })

  it('says so when the views cannot be loaded', async () => {
    m.get.mockRejectedValue(new Error('down'))
    render(<PageViewChart tenantId={5} />)
    expect(await screen.findByText(/could not be loaded/i)).toBeInTheDocument()
  })
})

describe('analytics tables', () => {
  it('shows recorded referrers with their share', async () => {
    m.get.mockResolvedValue({
      data: [
        { referrer: 'https://a.io', count: 3 },
        { referrer: '', count: 1 },
      ],
    })
    render(<ReferrersTable tenantId={5} />)
    expect(await screen.findByText('https://a.io')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('Direct')).toBeInTheDocument()
    expect(urls()).toContain('/api/analytics/traffic-sources?tenant_id=5')
  })

  it('shows recorded searches', async () => {
    m.get.mockResolvedValue({ data: [{ query: 'react hooks', count: 12 }] })
    render(<SearchesTable tenantId={5} />)
    expect(await screen.findByText('react hooks')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('never shows made-up numbers when nothing is recorded', async () => {
    m.get.mockResolvedValue({ data: [] })
    render(
      <>
        <ReferrersTable tenantId={5} />
        <SearchesTable tenantId={5} />
      </>,
    )
    expect(
      await screen.findByText('No visits recorded yet.'),
    ).toBeInTheDocument()
    expect(screen.getByText('No searches recorded yet.')).toBeInTheDocument()
    expect(screen.queryByText('Google Search')).toBeNull()
  })

  it('distinguishes a failure from an empty list', async () => {
    m.get.mockRejectedValue(new Error('down'))
    render(<SearchesTable tenantId={5} />)
    expect(await screen.findByText('Could not be loaded.')).toBeInTheDocument()
  })
})
