import { render, screen, fireEvent } from '@testing-library/react'
import { ArticleActions } from '@/components/articles/ArticleActions'
import { ArticleContent } from '@/components/articles/ArticleContent'
import { ArticleMetadata } from '@/components/articles/ArticleMetadata'
import {
  ArticleVoteButtons,
} from '@/components/articles/ArticleVoteButtons'

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <p>{children}</p>,
}))
jest.mock('remark-gfm', () => ({ __esModule: true, default: {} }))

it('links to edit and revisions', () => {
  render(<ArticleActions slug="s" name="n" revisionCount={4} />)
  expect(screen.getByTestId('edit-article-btn'))
    .toHaveAttribute('href', '/site/s/articles/n/edit')
  const rev = screen.getByTestId('revisions-btn')
  expect(rev).toHaveAttribute('href', '/site/s/articles/n/revisions')
  expect(rev).toHaveTextContent('Revisions (4)')
})

it('renders html content sanitized', () => {
  render(<ArticleContent renderer="html"
    content={'<b>hi</b><script>bad()</script>'} />)
  const el = screen.getByTestId('article-content')
  expect(el.innerHTML).toContain('<b>hi</b>')
  expect(el.innerHTML).not.toContain('script')
})

it('renders markdown content', () => {
  render(<ArticleContent renderer="markdown" content="# T" />)
  expect(screen.getByTestId('markdown-preview')).toHaveTextContent('# T')
})

it('renders metadata', () => {
  render(<ArticleMetadata author="a" date="d" renderer="html" views={2} />)
  expect(screen.getByTestId('meta-author')).toHaveTextContent('a')
  expect(screen.getByTestId('meta-views')).toHaveTextContent('2 views')
  expect(screen.getByTestId('meta-renderer')).toHaveTextContent('html')
  expect(screen.getByTestId('meta-date')).toHaveTextContent('d')
})

it('vote buttons call back', () => {
  const onVote = jest.fn()
  render(<ArticleVoteButtons likes={1} dislikes={2} onVote={onVote} />)
  fireEvent.click(screen.getByTestId('like-btn'))
  fireEvent.click(screen.getByTestId('dislike-btn'))
  expect(onVote.mock.calls).toEqual([[true], [false]])
  expect(screen.getByTestId('like-count')).toHaveTextContent('1')
  expect(screen.getByTestId('dislike-count')).toHaveTextContent('2')
})

it('vote buttons work without handler', () => {
  render(<ArticleVoteButtons likes={0} dislikes={0} />)
  fireEvent.click(screen.getByTestId('like-btn'))
  fireEvent.click(screen.getByTestId('dislike-btn'))
})
