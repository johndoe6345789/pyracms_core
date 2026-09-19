import { render, screen } from '@testing-library/react'
import RecentActivity from '@/components/activity/RecentActivity'
import { m } from '../../helpers/scopeApi'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

beforeEach(() => jest.resetAllMocks())

const row = (id: number, link: string) => ({
  id,
  type: 'article',
  actor: 'ann',
  title: `T${id}`,
  link,
  createdAt: '2026-01-01T00:00:00Z',
})

it('lists activity with links and drops unsafe ones', async () => {
  m.get.mockResolvedValue({
    data: [row(1, '/site/s/articles/a'), row(2, 'javascript:alert(1)')],
  })
  render(<RecentActivity tenantId={4} limit={5} />)
  expect(await screen.findByRole('link', { name: 'T1' })).toHaveAttribute(
    'href',
    '/site/s/articles/a',
  )
  expect(screen.queryByRole('link', { name: 'T2' })).toBeNull()
  expect(screen.getByText('T2')).toBeInTheDocument()
  expect(m.get).toHaveBeenCalledWith('/api/activity?tenant_id=4&limit=5')
})

it('shows empty and failed states', async () => {
  m.get.mockResolvedValueOnce({ data: [] })
  const a = render(<RecentActivity tenantId={1} />)
  expect(await screen.findByText('Nothing has happened yet.')).toBeVisible()
  a.unmount()
  m.get.mockRejectedValueOnce(new Error('x'))
  render(<RecentActivity tenantId={1} />)
  expect(await screen.findByText(/unavailable/)).toBeVisible()
})

it('does not fetch without a tenant', () => {
  render(<RecentActivity tenantId={null} />)
  expect(m.get).not.toHaveBeenCalled()
})
