import { render, screen, fireEvent } from '@testing-library/react'
import CommentActions from '@/components/common/comment/CommentActions'
import CommentHeader from '@/components/common/comment/CommentHeader'
import { timeAgo, type Comment } from '@/components/common/comment/types'

const c = { id: 1, user_id: 1, username: 'bob', avatar: null,
  content: 'hi', parent_id: null, upvotes: 3, downvotes: 1,
  user_vote: 1, created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z', children: [] } as Comment

describe('timeAgo', () => {
  const ago = (ms: number) => timeAgo(new Date(Date.now() - ms).toISOString())
  it('buckets durations', () => {
    expect(ago(1000)).toBe('just now')
    expect(ago(5 * 60000)).toBe('5m ago')
    expect(ago(3 * 3600000)).toBe('3h ago')
    expect(ago(2 * 86400000)).toBe('2d ago')
    expect(ago(65 * 86400000)).toBe('2mo ago')
  })
})

describe('CommentHeader', () => {
  it('flags edited comments', () => {
    const { rerender } = render(<CommentHeader comment={c} />)
    expect(screen.queryByText('(edited)')).toBeNull()
    rerender(<CommentHeader comment={{ ...c, updated_at: 'later' }} />)
    expect(screen.getByText('(edited)')).toBeInTheDocument()
  })
})

describe('CommentActions', () => {
  const p = { comment: c, isAuthenticated: true, isOwner: true, depth: 0,
    onVote: jest.fn(), onReply: jest.fn(), onEdit: jest.fn(),
    onDelete: jest.fn() }

  it('fires every action for an owner', () => {
    render(<CommentActions {...p} />)
    fireEvent.click(screen.getByTestId('comment-upvote-btn'))
    fireEvent.click(screen.getByTestId('comment-downvote-btn'))
    fireEvent.click(screen.getByTestId('comment-reply-btn'))
    fireEvent.click(screen.getByTestId('comment-edit-btn'))
    fireEvent.click(screen.getByTestId('comment-delete-btn'))
    expect(p.onVote).toHaveBeenNthCalledWith(1, 1)
    expect(p.onVote).toHaveBeenNthCalledWith(2, -1)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('hides reply/owner controls for guests and deep replies', () => {
    render(<CommentActions {...p} isAuthenticated={false}
      isOwner={false} comment={{ ...c, user_vote: -1 }} />)
    expect(screen.queryByTestId('comment-reply-btn')).toBeNull()
    expect(screen.queryByTestId('comment-edit-btn')).toBeNull()
    expect(screen.getByTestId('comment-upvote-btn')).toBeDisabled()
  })

  it('hides reply at max depth', () => {
    render(<CommentActions {...p} depth={4} />)
    expect(screen.queryByTestId('comment-reply-btn')).toBeNull()
  })
})
