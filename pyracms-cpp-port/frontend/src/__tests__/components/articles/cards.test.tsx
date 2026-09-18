import { render, screen, fireEvent } from '@testing-library/react'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { ArticleList } from '@/components/articles/ArticleList'
import { ArticleTagChips } from '@/components/articles/ArticleTagChips'
import { ArticleCardMeta } from '@/components/articles/ArticleCardMeta'
import { ArticleSearchBar } from '@/components/articles/ArticleSearchBar'

const art = {
  name: 'intro', title: 'Intro', excerpt: 'Hello...',
  author: 'ann', date: '2024-01-01', views: 5, tags: ['a', 'b'],
}

it('renders a card with link and meta', () => {
  render(<ArticleCard article={art} slug="s" />)
  expect(screen.getByTestId('article-card-intro')).toBeInTheDocument()
  expect(screen.getByTestId('article-card-link-intro'))
    .toHaveAttribute('href', '/site/s/articles/intro')
  expect(screen.getByText('Intro')).toBeInTheDocument()
  expect(screen.getByText('ann')).toBeInTheDocument()
})

it('renders a list of cards', () => {
  render(<ArticleList slug="s"
    articles={[art, { ...art, name: 'two' }]} />)
  expect(screen.getAllByRole('listitem').length).toBeGreaterThan(1)
  expect(screen.getByTestId('article-card-two')).toBeInTheDocument()
})

it('renders plain tag chips', () => {
  render(<ArticleTagChips tags={['x', 'y']} />)
  expect(screen.getByTestId('tag-chip-x')).toBeInTheDocument()
  expect(screen.getByTestId('tag-chip-y')).not.toHaveAttribute('href')
})

it('renders linked tag chips', () => {
  render(<ArticleTagChips tags={['x y']} searchSlug="s" color="primary" />)
  expect(screen.getByTestId('tag-chip-x y'))
    .toHaveAttribute('href', '/search?site=s&q=x+y')
})

it('renders card meta', () => {
  render(<ArticleCardMeta author="bob" date="d" views={3} />)
  expect(screen.getByText('bob')).toBeInTheDocument()
  expect(screen.getByText('3')).toBeInTheDocument()
})

it('search bar reports changes', () => {
  const onChange = jest.fn()
  render(<ArticleSearchBar value="" onChange={onChange} />)
  fireEvent.change(
    screen.getByRole('textbox'), { target: { value: 'q' } })
  expect(onChange).toHaveBeenCalledWith('q')
})
