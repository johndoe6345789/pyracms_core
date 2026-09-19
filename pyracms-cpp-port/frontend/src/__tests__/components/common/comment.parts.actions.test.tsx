import { render, screen, fireEvent } from '@testing-library/react'
import CommentActions from '@/components/common/comment/CommentActions'
import { c } from '../../helpers/commentPartsFixture'

describe('CommentActions', () => {
  const p = {
    comment: c,
    isAuthenticated: true,
    isOwner: true,
    depth: 0,
    onVote: jest.fn(),
    onReply: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  }

  it('fires every action for an owner', () => {
    render(<CommentActions {...p} />)
    fireEvent.click(screen.getByTestId('comment-upvote-btn'))
    fireEvent.click(screen.getByTestId('comment-downvote-btn'))
    fireEvent.click(screen.getByTestId('comment-reply-btn'))
    fireEvent.click(screen.getByTestId('comment-edit-btn'))
    fireEvent.click(screen.getByTestId('comment-delete-btn'))
    expect(p.onVote).toHaveBeenNthCalledWith(1, true)
    expect(p.onVote).toHaveBeenNthCalledWith(2, false)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByTestId('comment-dislikes')).toHaveTextContent('1')
  })

  it('hides reply/owner controls for guests and deep replies', () => {
    render(
      <CommentActions
        {...p}
        isAuthenticated={false}
        isOwner={false}
        comment={c}
      />,
    )
    expect(screen.queryByTestId('comment-reply-btn')).toBeNull()
    expect(screen.queryByTestId('comment-edit-btn')).toBeNull()
    expect(screen.getByTestId('comment-upvote-btn')).toBeDisabled()
  })

  it('hides reply at max depth', () => {
    render(<CommentActions {...p} depth={4} />)
    expect(screen.queryByTestId('comment-reply-btn')).toBeNull()
  })
})
