import { render, screen, fireEvent } from '@testing-library/react'
import { ThreadModActions } from '@/components/forum/ThreadModActions'

jest.mock('@/hooks/useForumCategories', () => ({
  useForumCategories: () => ({ categories: [{
    id: '1', name: 'Cat',
    forums: [{ id: '5', name: 'Tech' }, { id: '6', name: 'Off' }],
  }] }),
}))

const base = {
  threadId: '9', isPinned: false, isLocked: false, tenantId: 1,
}

it('moves a thread to the picked forum', () => {
  const onMove = jest.fn()
  render(<ThreadModActions {...base} isModerator onMove={onMove} />)
  fireEvent.click(screen.getByTestId('thread-actions-9'))
  fireEvent.click(screen.getByTestId('thread-action-move'))
  fireEvent.mouseDown(screen.getByRole('combobox'))
  fireEvent.click(screen.getByText('Cat / Tech'))
  fireEvent.click(screen.getByTestId('move-thread-confirm'))
  expect(onMove).toHaveBeenCalledWith('5')
})

it('renders nothing for non-moderators', () => {
  render(<ThreadModActions {...base} isModerator={false} />)
  expect(screen.queryByTestId('thread-actions-9')).toBeNull()
})
