import { screen, fireEvent, waitFor } from '@testing-library/react'
import CommentItem from '@/components/common/comment/CommentItem'
import { makeUser } from '../../helpers/renderWithStore'
import { renderPlain as renderWithStore } from '../../helpers/plainStore'
import type { Comment } from '@/components/common/comment/types'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}))
const m = api as unknown as Record<string, jest.Mock>
const refresh = jest.fn()
beforeEach(() => {
  Object.values(m).forEach((f) => f.mockReset().mockResolvedValue({}))
  refresh.mockReset()
})

const c: Comment = {
  id: 5,
  userId: 1,
  username: 'bob',
  contentType: 'a',
  contentId: 2,
  body: 'hello',
  parentId: null,
  likes: 0,
  dislikes: 0,
  createdAt: 'x',
  updatedAt: 'x',
  children: [],
}
type U = ReturnType<typeof makeUser> | null
const show = (u: U = makeUser(), depth = 1) =>
  renderWithStore(
    <CommentItem
      comment={c}
      contentType="a"
      contentId={2}
      depth={depth}
      onRefresh={refresh}
    />,
    u ?? undefined,
  )

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
