import { render, screen, fireEvent } from '@testing-library/react'
import { ThreadActions } from '@/components/forum/ThreadActions'

const props = { threadId: '4', isPinned: false, isLocked: false }

it('renders nothing for non-moderators', () => {
  const { container } = render(<ThreadActions {...props} isModerator={false} />)
  expect(container).toBeEmptyDOMElement()
})

it('pins, locks and labels reflect state', () => {
  const onPin = jest.fn()
  const onLock = jest.fn()
  render(
    <ThreadActions
      {...props}
      isPinned
      isLocked
      isModerator
      onPin={onPin}
      onLock={onLock}
    />,
  )
  fireEvent.click(screen.getByTestId('thread-actions-4'))
  expect(screen.getByText('Unpin Thread')).toBeInTheDocument()
  fireEvent.click(screen.getByTestId('thread-action-pin'))
  expect(onPin).toHaveBeenCalled()
  fireEvent.click(screen.getByTestId('thread-actions-4'))
  expect(screen.getByText('Unlock Thread')).toBeInTheDocument()
  fireEvent.click(screen.getByTestId('thread-action-lock'))
  expect(onLock).toHaveBeenCalled()
})

it('confirms thread deletion', () => {
  const onDelete = jest.fn()
  render(<ThreadActions {...props} isModerator onDelete={onDelete} />)
  fireEvent.click(screen.getByTestId('thread-actions-4'))
  fireEvent.click(screen.getByTestId('thread-action-delete'))
  fireEvent.click(screen.getByTestId('delete-thread-cancel'))
  fireEvent.click(screen.getByTestId('thread-actions-4'))
  fireEvent.click(screen.getByTestId('thread-action-delete'))
  fireEvent.click(screen.getByTestId('delete-thread-confirm'))
  expect(onDelete).toHaveBeenCalledTimes(1)
})

it('moves a thread to a chosen forum', () => {
  const onMove = jest.fn()
  render(
    <ThreadActions
      {...props}
      isModerator
      onMove={onMove}
      forums={[{ id: '9', name: 'Nine' }]}
    />,
  )
  fireEvent.click(screen.getByTestId('thread-actions-4'))
  fireEvent.click(screen.getByTestId('thread-action-move'))
  expect(screen.getByTestId('move-thread-confirm')).toBeDisabled()
  fireEvent.mouseDown(screen.getByRole('combobox'))
  fireEvent.click(screen.getByText('Nine'))
  fireEvent.click(screen.getByTestId('move-thread-confirm'))
  expect(onMove).toHaveBeenCalledWith('9')
})

it('cancels a move', () => {
  render(<ThreadActions {...props} isModerator onMove={jest.fn()} />)
  fireEvent.click(screen.getByTestId('thread-actions-4'))
  fireEvent.click(screen.getByTestId('thread-action-move'))
  fireEvent.click(screen.getByTestId('move-thread-cancel'))
})

it('hides Move when no move handler exists (no backend endpoint)', () => {
  render(<ThreadActions {...props} isModerator />)
  fireEvent.click(screen.getByTestId('thread-actions-4'))
  expect(screen.queryByTestId('thread-action-move')).toBeNull()
  expect(screen.getByTestId('thread-action-delete')).toBeInTheDocument()
})
