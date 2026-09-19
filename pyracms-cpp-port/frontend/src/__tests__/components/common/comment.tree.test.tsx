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
  id, userId: 1, username: 'bob', contentType: 'a', contentId: 1,
  body: `c${id}`, parentId: null, likes: 0, dislikes: 0,
  createdAt: 'x', updatedAt: 'x', children: kids })
const flat = (id: number, parentId: number | null = null) => {
  const { children, ...rest } = mk(id)
  void children
  return { ...rest, parentId }
}

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
    m.get!.mockResolvedValue({ data: [flat(1), flat(2, 1)] })
    renderWithStore(<CommentSection contentType="a" contentId={1} />)
    expect(await screen.findByText('c1')).toBeInTheDocument()
    expect(screen.getByText('c2')).toBeInTheDocument()
    expect(screen.queryByTestId('comment-input')).toBeNull()
    expect(screen.getByTestId('comment-login-hint'))
      .toHaveTextContent('Log in to post')
  })

  it('shows the form when signed in and survives errors', async () => {
    m.get!.mockRejectedValue(new Error('x'))
    renderWithStore(
      <CommentSection contentType="a" contentId={1} />, makeUser())
    expect(await screen.findByTestId('comment-input')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText(/Be the first/))
      .toBeInTheDocument())
  })

  it('handles a non-array response', async () => {
    m.get!.mockResolvedValue({ data: {} })
    renderWithStore(<CommentSection contentType="a" contentId={1} />)
    expect(await screen.findByText(/Be the first/)).toBeInTheDocument()
  })
})
