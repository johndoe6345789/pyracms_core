import { render, screen, fireEvent } from '@testing-library/react'
import { ArticleActions } from '@/components/articles/ArticleActions'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { ArticleList } from '@/components/articles/ArticleList'
import { ArticleMetadata } from '@/components/articles/ArticleMetadata'
import { ArticleSearchBar } from '@/components/articles/ArticleSearchBar'
import { ArticleTagChips } from '@/components/articles/ArticleTagChips'
import {
  ArticleVoteButtons,
} from '@/components/articles/ArticleVoteButtons'

const art = (name: string) => ({
  name, title: `T ${name}`, excerpt: 'ex', author: 'au', date: '2024',
  views: 5, tags: ['x'],
})

it('ArticleActions builds links', () => {
  render(<ArticleActions slug="s" name="n" revisionCount={3} />)
  expect(screen.getByTestId('edit-article-btn')).toHaveAttribute(
    'href', '/site/s/articles/n/edit')
  expect(screen.getByTestId('revisions-btn')).toHaveTextContent('(3)')
})

it('ArticleCard and list render articles', () => {
  render(<ArticleCard article={art('a')} slug="s" />)
  expect(screen.getByTestId('article-card-link-a')).toHaveAttribute(
    'href', '/site/s/articles/a')
  expect(screen.getByText('au')).toBeInTheDocument()
})

it('ArticleList renders one card per article', () => {
  render(<ArticleList articles={[art('a'), art('b')]} slug="s" />)
  expect(screen.getAllByRole('listitem')).toHaveLength(4)
})

it('ArticleMetadata renders items', () => {
  render(<ArticleMetadata author="a" date="d" renderer="md" views={2} />)
  expect(screen.getByTestId('meta-views')).toHaveTextContent('2 views')
})

it('ArticleSearchBar emits changes', () => {
  const onChange = jest.fn()
  render(<ArticleSearchBar value="" onChange={onChange} />)
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'q' } })
  expect(onChange).toHaveBeenCalledWith('q')
})

it('ArticleTagChips renders plain and linked chips', () => {
  const { rerender } = render(<ArticleTagChips tags={['a b']} />)
  expect(screen.getByTestId('tag-chip-a b')).not.toHaveAttribute('href')
  rerender(<ArticleTagChips tags={['a b']} searchSlug="s" color="primary" />)
  expect(screen.getByTestId('tag-chip-a b')).toHaveAttribute(
    'href', '/search?site=s&q=a+b')
})

it('ArticleVoteButtons votes', () => {
  const onVote = jest.fn()
  const { rerender } = render(
    <ArticleVoteButtons likes={1} dislikes={2} onVote={onVote} />)
  fireEvent.click(screen.getByTestId('like-btn'))
  fireEvent.click(screen.getByTestId('dislike-btn'))
  expect(onVote.mock.calls).toEqual([[true], [false]])
  expect(screen.getByTestId('dislike-count')).toHaveTextContent('2')
  rerender(<ArticleVoteButtons likes={1} dislikes={2} />)
  fireEvent.click(screen.getByTestId('like-btn'))
})
