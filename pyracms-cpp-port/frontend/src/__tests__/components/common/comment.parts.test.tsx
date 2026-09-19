import { render, screen, fireEvent } from '@testing-library/react'
import { buildTree } from '@/components/common/comment/types'
import CommentActions from '@/components/common/comment/CommentActions'
import CommentHeader from '@/components/common/comment/CommentHeader'
import { timeAgo, type Comment } from '@/components/common/comment/types'

const c: Comment = { id: 1, userId: 1, username: 'bob',
  contentType: 'a', contentId: 1, body: 'hi', parentId: null,
  likes: 3, dislikes: 1, createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z', children: [] }

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
    rerender(<CommentHeader comment={{ ...c, updatedAt: 'later' }} />)
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
    expect(p.onVote).toHaveBeenNthCalledWith(1, true)
    expect(p.onVote).toHaveBeenNthCalledWith(2, false)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByTestId('comment-dislikes')).toHaveTextContent('1')
  })

  it('hides reply/owner controls for guests and deep replies', () => {
    render(<CommentActions {...p} isAuthenticated={false}
      isOwner={false} comment={c} />)
    expect(screen.queryByTestId('comment-reply-btn')).toBeNull()
    expect(screen.queryByTestId('comment-edit-btn')).toBeNull()
    expect(screen.getByTestId('comment-upvote-btn')).toBeDisabled()
  })

  it('hides reply at max depth', () => {
    render(<CommentActions {...p} depth={4} />)
    expect(screen.queryByTestId('comment-reply-btn')).toBeNull()
  })
})

describe('buildTree', () => {
  it('nests by parentId and roots orphans', () => {
    const t = buildTree([
      c, { ...c, id: 2, parentId: 1 }, { ...c, id: 3, parentId: 99 }])
    expect(t.map((n) => n.id)).toEqual([1, 3])
    expect(t[0]!.children.map((n) => n.id)).toEqual([2])
  })
})

it('links the author to their profile inside a site', () => {
  render(<CommentHeader comment={c} />)
  expect(screen.queryByTestId('comment-author-link')).toBeNull()
})
