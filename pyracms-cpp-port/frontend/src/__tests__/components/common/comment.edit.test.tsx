import { screen, fireEvent, waitFor } from '@testing-library/react'
import { m, resetApi, show } from '../../helpers/commentItemHelpers'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)
beforeEach(resetApi)

describe('CommentItem editing', () => {
  it('edits and saves', async () => {
    show()
    fireEvent.click(screen.getByTestId('comment-edit-btn'))
    const box = screen
      .getByTestId('comment-edit-input')
      .querySelector('textarea')!
    fireEvent.change(box, { target: { value: 'new' } })
    fireEvent.click(screen.getByTestId('comment-save-btn'))
    await waitFor(() =>
      expect(m.put).toHaveBeenCalledWith('/api/comments/5', { body: 'new' }),
    )
    expect(screen.queryByTestId('comment-save-btn')).toBeNull()
  })

  it('cancels editing and refuses blank saves', () => {
    show()
    fireEvent.click(screen.getByTestId('comment-edit-btn'))
    const box = screen
      .getByTestId('comment-edit-input')
      .querySelector('textarea')!
    fireEvent.change(box, { target: { value: ' ' } })
    fireEvent.click(screen.getByTestId('comment-save-btn'))
    expect(m.put).not.toHaveBeenCalled()
    fireEvent.click(screen.getByTestId('comment-edit-cancel-btn'))
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('deletes after confirmation', async () => {
    show()
    fireEvent.click(screen.getByTestId('comment-delete-btn'))
    fireEvent.click(screen.getByTestId('delete-comment-confirm-btn'))
    await waitFor(() =>
      expect(m.delete).toHaveBeenCalledWith('/api/comments/5'),
    )
  })
})
