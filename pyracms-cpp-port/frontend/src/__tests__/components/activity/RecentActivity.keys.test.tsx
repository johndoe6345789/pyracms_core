import { render, screen } from '@testing-library/react'
import RecentActivity from '@/components/activity/RecentActivity'
import { m } from '../../helpers/scopeApi'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

const item = (type: string, title: string) => ({
  id: 2, // ids are per type: an article and a comment can both be 2
  type,
  actor: 'ann',
  title,
  link: '/site/s/x',
  createdAt: '2026-01-01T00:00:00Z',
})

it('shows items that share an id across types, without key clashes', async () => {
  const error = jest.spyOn(console, 'error').mockImplementation(() => {})
  m.get.mockResolvedValue({
    data: [item('article', 'An article'), item('comment', 'A comment')],
  })
  render(<RecentActivity tenantId={4} />)
  expect(await screen.findByText('An article')).toBeInTheDocument()
  expect(screen.getByText('A comment')).toBeInTheDocument()
  const clash = error.mock.calls.filter((c) => String(c[0]).includes('key'))
  expect(clash).toHaveLength(0)
  error.mockRestore()
})
