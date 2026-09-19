import { screen, fireEvent, waitFor } from '@testing-library/react'
import { makeUser } from '../../helpers/renderWithStore'
import { m, refresh, resetApi, show } from '../../helpers/commentItemHelpers'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)
beforeEach(resetApi)

describe('CommentItem', () => {
  it('votes like and dislike', async () => {
    show()
    fireEvent.click(screen.getByTestId('comment-upvote-btn'))
    await waitFor(() =>
      expect(m.post).toHaveBeenCalledWith('/api/comments/5/vote', {
        isLike: true,
      }),
    )
    expect(refresh).toHaveBeenCalled()
    fireEvent.click(screen.getByTestId('comment-downvote-btn'))
    await waitFor(() =>
      expect(m.post).toHaveBeenLastCalledWith('/api/comments/5/vote', {
        isLike: false,
      }),
    )
  })

  it('ignores votes from guests', () => {
    show(null)
    fireEvent.click(screen.getByTestId('comment-upvote-btn'))
    expect(m.post).not.toHaveBeenCalled()
  })

  it('opens and closes the reply form', () => {
    show(makeUser(), 0)
    fireEvent.click(screen.getByTestId('comment-reply-btn'))
    expect(screen.getByPlaceholderText('Write a reply...')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('comment-cancel-btn'))
    expect(screen.queryByPlaceholderText('Write a reply...')).toBeNull()
  })

  it('swallows api errors', async () => {
    m.put!.mockRejectedValue(new Error('x'))
    m.delete!.mockRejectedValue(new Error('x'))
    m.post!.mockRejectedValue(new Error('x'))
    show()
    fireEvent.click(screen.getByTestId('comment-upvote-btn'))
    fireEvent.click(screen.getByTestId('comment-edit-btn'))
    fireEvent.click(screen.getByTestId('comment-save-btn'))
    await waitFor(() => expect(m.put).toHaveBeenCalled())
    fireEvent.click(screen.getByTestId('comment-delete-btn'))
    fireEvent.click(screen.getByTestId('delete-comment-confirm-btn'))
    await waitFor(() => expect(m.delete).toHaveBeenCalled())
    expect(refresh).not.toHaveBeenCalled()
  })
})
