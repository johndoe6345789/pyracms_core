import { render, screen, fireEvent } from '@testing-library/react'
import { ThreadTable } from '@/components/forum/ThreadTable'
import type { ThreadSummary } from '@/hooks/useThreadList'

const make = (i: number, extra = {}): ThreadSummary => ({
  id: String(i), title: `Thread ${i}`, author: 'ann', replies: i,
  views: 10 + i, lastPostDate: '2024-01-01 10:00', pinned: false,
  locked: false, ...extra,
})

it('renders rows with links and badges', () => {
  render(<ThreadTable slug="s" threads={[
    make(1, { pinned: true }), make(2, { locked: true }),
  ]} />)
  expect(screen.getByTestId('thread-row-1'))
    .toHaveAttribute('href', '/site/s/forum/thread/1')
  expect(screen.getByText('Pinned')).toBeInTheDocument()
  expect(screen.getByText('Locked')).toBeInTheDocument()
  expect(screen.getByText('Last Post')).toBeInTheDocument()
  expect(screen.queryByTestId('thread-pagination')).toBeNull()
})

it('paginates long lists', () => {
  const threads = Array.from({ length: 25 }, (_, i) => make(i + 1))
  render(<ThreadTable slug="s" threads={threads} />)
  expect(screen.getByTestId('thread-row-20')).toBeInTheDocument()
  expect(screen.queryByTestId('thread-row-21')).toBeNull()
  fireEvent.click(screen.getByLabelText('Go to page 2'))
  expect(screen.getByTestId('thread-row-21')).toBeInTheDocument()
})
