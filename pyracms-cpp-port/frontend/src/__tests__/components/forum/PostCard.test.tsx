import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PostCard } from '@/components/forum/PostCard'
import type { Post } from '@/hooks/useThread'

const post: Post = {
  id: '1', author: 'ann', date: '2024-01-01 10:00', content: 'hello',
  likes: 2, dislikes: 1, isOwner: true,
}

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

it('edits and saves', async () => {
  const onEdit = jest.fn().mockResolvedValue(undefined)
  render(<PostCard post={post} onEdit={onEdit} />)
  fireEvent.click(screen.getByTestId('post-edit-btn'))
  fireEvent.change(
    screen.getByTestId('post-edit-input').querySelector('textarea')!,
    { target: { value: 'changed' } })
  fireEvent.click(screen.getByTestId('post-save-btn'))
  expect(onEdit).toHaveBeenCalledWith('1', 'changed')
  await waitFor(() => expect(screen.queryByTestId('post-edit-input'))
    .toBeNull())
})

it('cancels editing', () => {
  render(<PostCard post={post} />)
  fireEvent.click(screen.getByTestId('post-edit-btn'))
  fireEvent.click(screen.getByTestId('post-cancel-edit-btn'))
  expect(screen.getByText('hello')).toBeInTheDocument()
})

it('confirms deletion', async () => {
  const onDelete = jest.fn().mockResolvedValue(undefined)
  render(<PostCard post={post} onDelete={onDelete} />)
  fireEvent.click(screen.getByTestId('post-delete-btn'))
  fireEvent.click(screen.getByTestId('post-delete-cancel-btn'))
  fireEvent.click(screen.getByTestId('post-delete-btn'))
  fireEvent.click(screen.getByTestId('post-delete-confirm-btn'))
  await waitFor(() => expect(onDelete).toHaveBeenCalledWith('1'))
})

it('survives failing edit and delete', async () => {
  const fail = jest.fn().mockRejectedValue(new Error('x'))
  render(<PostCard post={post} onEdit={fail} onDelete={fail} />)
  fireEvent.click(screen.getByTestId('post-edit-btn'))
  fireEvent.click(screen.getByTestId('post-save-btn'))
  await waitFor(() => expect(fail).toHaveBeenCalledTimes(1))
  fireEvent.click(screen.getByTestId('post-cancel-edit-btn'))
  fireEvent.click(screen.getByTestId('post-delete-btn'))
  fireEvent.click(screen.getByTestId('post-delete-confirm-btn'))
  await waitFor(() => expect(fail).toHaveBeenCalledTimes(2))
})
