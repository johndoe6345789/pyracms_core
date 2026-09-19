import { render, screen, fireEvent, waitFor }
  from '@testing-library/react'
import EditForm from '@/components/common/comment/EditForm'
import CommentForm from '@/components/common/comment/CommentForm'
import DeleteCommentDialog
  from '@/components/common/comment/DeleteCommentDialog'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true, default: { post: jest.fn() },
}))
const post = api.post as jest.Mock
beforeEach(() => post.mockReset())

describe('EditForm and DeleteCommentDialog', () => {
  it('EditForm edits, saves and cancels', () => {
    const p = { setEditText: jest.fn(), onSave: jest.fn(),
      onCancel: jest.fn() }
    render(<EditForm editText="t" submitting={false} {...p} />)
    fireEvent.change(screen.getByTestId('comment-edit-input')
      .querySelector('textarea')!, { target: { value: 'z' } })
    fireEvent.click(screen.getByTestId('comment-save-btn'))
    fireEvent.click(screen.getByTestId('comment-edit-cancel-btn'))
    expect(p.setEditText).toHaveBeenCalledWith('z')
    expect(p.onSave).toHaveBeenCalled()
    expect(p.onCancel).toHaveBeenCalled()
  })

  it('DeleteCommentDialog confirms and cancels', () => {
    const [close, ok] = [jest.fn(), jest.fn()]
    render(<DeleteCommentDialog open onClose={close} onConfirm={ok} />)
    fireEvent.click(screen.getByTestId('delete-comment-confirm-btn'))
    fireEvent.click(screen.getByTestId('delete-comment-cancel-btn'))
    expect(ok).toHaveBeenCalled()
    expect(close).toHaveBeenCalled()
  })
})

describe('CommentForm', () => {
  const input = () => screen.getByTestId('comment-input')
    .querySelector('textarea')!

  it('posts a comment then clears', async () => {
    post.mockResolvedValue({})
    const done = jest.fn()
    render(<CommentForm contentType="article" contentId={2}
      onSubmitted={done} />)
    expect(screen.getByTestId('comment-submit-btn')).toBeDisabled()
    fireEvent.change(input(), { target: { value: 'yo' } })
    fireEvent.click(screen.getByTestId('comment-submit-btn'))
    await waitFor(() => expect(done).toHaveBeenCalled())
    expect(post).toHaveBeenCalledWith('/api/comments/article/2',
      { body: 'yo' })
  })

  it('keeps the text on failure and can cancel', async () => {
    post.mockRejectedValue(new Error('x'))
    const cancel = jest.fn()
    render(<CommentForm contentType="a" contentId={1} parentId={5}
      onSubmitted={jest.fn()} onCancel={cancel} />)
    fireEvent.change(input(), { target: { value: 'yo' } })
    fireEvent.click(screen.getByTestId('comment-submit-btn'))
    await waitFor(() => expect(post).toHaveBeenCalled())
    fireEvent.click(screen.getByTestId('comment-cancel-btn'))
    expect(cancel).toHaveBeenCalled()
    expect(input().value).toBe('yo')
  })
})
