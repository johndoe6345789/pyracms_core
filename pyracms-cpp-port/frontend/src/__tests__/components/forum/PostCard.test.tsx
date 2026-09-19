import { render, screen, fireEvent } from '@testing-library/react'
import { PostCard } from '@/components/forum/PostCard'
import { post } from '../../helpers/forumPost'

it('renders the post and votes', () => {
  const onVote = jest.fn()
  render(<PostCard post={post} onVote={onVote} />)
  expect(screen.getByText('hello')).toBeInTheDocument()
  fireEvent.click(screen.getByTestId('vote-like-button'))
  fireEvent.click(screen.getByTestId('vote-dislike-button'))
  expect(onVote).toHaveBeenNthCalledWith(1, '1', true)
  expect(onVote).toHaveBeenNthCalledWith(2, '1', false)
  expect(screen.getByTestId('vote-like-count')).toHaveTextContent('2')
})

it('disables voting when not allowed', () => {
  render(<PostCard post={post} canVote={false} />)
  expect(screen.getByTestId('vote-like-button')).toBeDisabled()
})

it('quotes the post', () => {
  const onQuote = jest.fn()
  render(<PostCard post={post} onQuote={onQuote} />)
  fireEvent.click(screen.getByText('Quote'))
  expect(onQuote).toHaveBeenCalledWith('ann', 'hello')
})

it('hides owner controls for other users', () => {
  render(<PostCard post={{ ...post, isOwner: false }} />)
  expect(screen.queryByTestId('post-edit-btn')).toBeNull()
})
