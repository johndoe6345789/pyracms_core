import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PostCard } from '@/components/forum/PostCard'
import type { Post } from '@/hooks/useThread'

const post: Post = {
  id: '1', author: 'ann', date: '2024-01-01 10:00', content: 'hello',
  likes: 2, dislikes: 1, isOwner: true,
}
const boom = { response: { data: { error: 'boom' } } }

it('shows a failed edit and keeps editing', async () => {
  const onEdit = jest.fn().mockRejectedValue(boom)
  render(<PostCard post={post} onEdit={onEdit} />)
  fireEvent.click(screen.getByTestId('post-edit-btn'))
  fireEvent.click(screen.getByTestId('post-save-btn'))
  expect(await screen.findByTestId('post-error'))
    .toHaveTextContent('boom')
  expect(screen.getByTestId('post-edit-input')).toBeInTheDocument()
})

it('shows a failed delete, none on success', async () => {
  const onDelete = jest.fn().mockRejectedValueOnce(boom)
    .mockResolvedValue(undefined)
  render(<PostCard post={post} onDelete={onDelete} />)
  fireEvent.click(screen.getByTestId('post-delete-btn'))
  fireEvent.click(screen.getByTestId('post-delete-confirm-btn'))
  expect(await screen.findByTestId('post-error'))
    .toHaveTextContent('boom')
  fireEvent.click(screen.getByTestId('post-delete-btn'))
  fireEvent.click(screen.getByTestId('post-delete-confirm-btn'))
  await waitFor(() => expect(screen.queryByTestId('post-error'))
    .toBeNull())
})
