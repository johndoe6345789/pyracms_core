import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PostCard } from '@/components/forum/PostCard'
import { post } from '../../helpers/forumPost'

it('edits and saves', async () => {
  const onEdit = jest.fn().mockResolvedValue(undefined)
  render(<PostCard post={post} onEdit={onEdit} />)
  fireEvent.click(screen.getByTestId('post-edit-btn'))
  fireEvent.change(
    screen.getByTestId('post-edit-input').querySelector('textarea')!,
    { target: { value: 'changed' } },
  )
  fireEvent.click(screen.getByTestId('post-save-btn'))
  expect(onEdit).toHaveBeenCalledWith('1', 'changed')
  await waitFor(() =>
    expect(screen.queryByTestId('post-edit-input')).toBeNull(),
  )
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
