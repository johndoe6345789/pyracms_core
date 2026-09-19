import { render, screen, fireEvent } from '@testing-library/react'
import { PostList } from '@/components/forum/PostList'
import type { Post } from '@/hooks/useThread'

const posts: Post[] = Array.from({ length: 21 }, (_, i) => ({
  id: String(i + 1),
  author: 'a',
  date: '',
  content: `c${i + 1}`,
  likes: 0,
  dislikes: 0,
  isOwner: false,
}))
const cbs = {
  onVote: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onQuote: jest.fn(),
}

it('paginates posts and hides quote when not allowed', () => {
  const onPage = jest.fn()
  const { rerender } = render(
    <PostList
      posts={posts}
      page={1}
      onPage={onPage}
      canVote
      canQuote
      {...cbs}
    />,
  )
  expect(screen.getAllByText('Quote')).toHaveLength(20)
  fireEvent.click(screen.getByLabelText('Go to page 2'))
  expect(onPage).toHaveBeenCalledWith(2)
  rerender(
    <PostList
      posts={posts}
      page={99}
      onPage={onPage}
      canVote
      canQuote={false}
      {...cbs}
    />,
  )
  expect(screen.getByText('c21')).toBeInTheDocument()
  expect(screen.queryByText('Quote')).toBeNull()
})
