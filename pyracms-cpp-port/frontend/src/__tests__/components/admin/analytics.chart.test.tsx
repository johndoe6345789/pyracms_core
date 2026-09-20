import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PageViewChart } from '@/components/admin/charts/PageViewChart'
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
