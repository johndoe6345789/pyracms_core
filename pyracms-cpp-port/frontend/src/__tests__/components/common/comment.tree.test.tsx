import { screen, fireEvent, waitFor } from '@testing-library/react'
import CommentSection from '@/components/common/CommentSection'
import CommentList from '@/components/common/comment/CommentList'
import { makeUser } from '../../helpers/renderWithStore'
import { renderPlain as renderWithStore } from '../../helpers/plainStore'
import type { Comment } from '@/components/common/comment/types'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(),
    delete: jest.fn() },
}))
const m = api as unknown as Record<string, jest.Mock>
beforeEach(() => Object.values(m).forEach((f) => f.mockReset()))

const mk = (id: number, kids: Comment[] = []): Comment => ({
  id, user_id: 1, username: 'bob', avatar: id === 1 ? '/a.png' : null,
  content: `c${id}`, parent_id: null, upvotes: 0, downvotes: 0,
  user_vote: null, created_at: 'x', updated_at: 'x', children: kids })

describe('CommentList', () => {
  const p = { contentType: 'a', contentId: 1, onRefresh: jest.fn() }
  it('shows loading, empty and populated states', () => {
    const l = renderWithStore(<CommentList {...p} loading comments={[]} />)
    expect(l.container.querySelector('[role=progressbar]')).not.toBeNull()
    const e = renderWithStore(
      <CommentList {...p} loading={false} comments={[]} />)
    expect(e.getByText(/Be the first/)).toBeInTheDocument()
    const c = renderWithStore(<CommentList {...p} loading={false}
      comments={[mk(1, [mk(2)])]} />)
    expect(c.getAllByText('c1')).toHaveLength(1)
    expect(c.getByText('c2')).toBeInTheDocument()
  })

  it('toggles replies', () => {
    const r = renderWithStore(<CommentList {...p} loading={false}
      comments={[mk(1, [mk(2), mk(3)])]} />)
    const t = r.getByTestId('toggle-replies-btn')
    expect(t).toHaveTextContent('Hide 2 replies')
    fireEvent.click(t)
    expect(t).toHaveTextContent('Show 2 replies')
  })
})

describe('CommentSection', () => {
  it('loads comments for guests without a form', async () => {
    m.get!.mockResolvedValue({ data: { comments: [mk(1)] } })
    renderWithStore(<CommentSection contentType="a" contentId={1} />)
    expect(await screen.findByText('c1')).toBeInTheDocument()
    expect(screen.queryByTestId('comment-input')).toBeNull()
  })

  it('shows the form when signed in and survives errors', async () => {
    m.get!.mockRejectedValue(new Error('x'))
    renderWithStore(
      <CommentSection contentType="a" contentId={1} />, makeUser())
    expect(await screen.findByTestId('comment-input')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText(/Be the first/))
      .toBeInTheDocument())
  })

  it('handles a response without comments', async () => {
    m.get!.mockResolvedValue({ data: {} })
    renderWithStore(<CommentSection contentType="a" contentId={1} />)
    expect(await screen.findByText(/Be the first/)).toBeInTheDocument()
  })
})
