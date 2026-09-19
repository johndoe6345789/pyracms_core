import { render, screen, waitFor } from '@testing-library/react'
import PageViewTracker from '@/components/analytics/PageViewTracker'
import SummaryCards, {
  humanize,
} from '@/components/admin/analytics/SummaryCards'
import { m } from '../../helpers/scopeApi'

let path = '/site/s/articles'
jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)
jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 's' }),
  usePathname: () => path,
}))
jest.mock(
  '@/hooks/useTenantId',
  () => jest.requireActual('../../helpers/scopeMocks').tenantMock,
)

const dnt = (v: string | null) =>
  Object.defineProperty(navigator, 'doNotTrack', {
    value: v,
    configurable: true,
  })

beforeEach(() => {
  jest.resetAllMocks()
  m.post.mockResolvedValue({})
  path = '/site/s/articles'
  dnt(null)
})

it('posts the path and tenant on load', async () => {
  render(<PageViewTracker />)
  await waitFor(() =>
    expect(m.post).toHaveBeenCalledWith('/api/analytics/track', {
      path: '/site/s/articles',
      tenant_id: 1,
      referrer: '',
    }),
  )
})

it('respects Do Not Track', () => {
  dnt('1')
  render(<PageViewTracker />)
  expect(m.post).not.toHaveBeenCalled()
})

it('skips admin pages and swallows failures', () => {
  path = '/site/s/admin/users'
  render(<PageViewTracker />)
  expect(m.post).not.toHaveBeenCalled()
  path = '/site/s'
  m.post.mockRejectedValue(new Error('x'))
  render(<PageViewTracker />)
  expect(m.post).toHaveBeenCalledTimes(1)
})

it('summary cards show numeric fields only', async () => {
  m.get.mockResolvedValue({ data: { totalViews: 1200, note: 'x' } })
  render(<SummaryCards tenantId={1} />)
  expect(await screen.findByText('Total views')).toBeInTheDocument()
  expect(screen.getByText('1,200')).toBeInTheDocument()
  expect(screen.queryByText('Note')).toBeNull()
  expect(humanize('uniqueVisitors')).toBe('Unique visitors')
})

it('summary cards render nothing on failure', async () => {
  m.get.mockRejectedValue(new Error('x'))
  render(<SummaryCards tenantId={1} />)
  await waitFor(() => expect(m.get).toHaveBeenCalled())
  expect(screen.queryByTestId('analytics-summary')).toBeNull()
})
