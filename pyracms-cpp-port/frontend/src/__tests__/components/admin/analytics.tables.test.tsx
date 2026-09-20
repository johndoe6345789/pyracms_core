import { render, screen } from '@testing-library/react'
import {
  ReferrersTable,
  SearchesTable,
} from '@/components/admin/analytics/AnalyticsTables'
import { m } from '../../helpers/scopeApi'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

beforeEach(() => jest.resetAllMocks())

const urls = () => m.get.mock.calls.map((c) => c[0] as string)

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
