import { render, screen, fireEvent } from '@testing-library/react'
import { SnippetCard } from '@/components/code/SnippetCard'
import { SnippetHeader } from '@/components/code/SnippetHeader'
import { mapSnippet } from '@/lib/snippets'

const props = {
  id: '5',
  title: 'Hello',
  language: 'python',
  siteSlug: 's',
  code: Array.from({ length: 10 }, (_, i) => `line${i}`).join('\n'),
  author: 'ann',
  date: '2024-01-01',
  runCount: 3,
}

it('renders card details and links', () => {
  render(<SnippetCard {...props} />)
  expect(screen.getByTestId('snippet-link-5')).toHaveAttribute(
    'href',
    '/site/s/snippets/5',
  )
  expect(screen.getByText('3 runs')).toBeInTheDocument()
  expect(screen.getByText(/line5/)).toBeInTheDocument()
  expect(screen.queryByText(/line6/)).toBeNull()
  expect(screen.queryByTestId('fork-snippet-5')).toBeNull()
})

it('forks and shares through callbacks', () => {
  const onFork = jest.fn()
  const onShare = jest.fn()
  render(<SnippetCard {...props} onFork={onFork} onShare={onShare} />)
  fireEvent.click(screen.getByTestId('fork-snippet-5'))
  fireEvent.click(screen.getByTestId('share-snippet-5'))
  expect(onFork).toHaveBeenCalled()
  expect(onShare).toHaveBeenCalled()
})

it('copies the link by default', () => {
  const writeText = jest.fn()
  Object.assign(navigator, { clipboard: { writeText } })
  render(<SnippetCard {...props} />)
  fireEvent.click(screen.getByTestId('share-snippet-5'))
  expect(writeText).toHaveBeenCalledWith(
    `${window.location.origin}/site/s/snippets/5`,
  )
})

it('renders the snippet header with fork badge', () => {
  render(
    <SnippetHeader
      s={mapSnippet({
        id: 1,
        title: 'T',
        language: 'go',
        authorUsername: 'bob',
        forkedFrom: 2,
        createdAt: '2024-05-06T00:00:00Z',
      })}
    />,
  )
  expect(screen.getByText('by bob')).toBeInTheDocument()
  expect(screen.getByText('Fork')).toBeInTheDocument()
})

it('omits the fork badge for originals', () => {
  render(<SnippetHeader s={mapSnippet({ id: 1, title: 'T' })} />)
  expect(screen.queryByText('Fork')).toBeNull()
})
