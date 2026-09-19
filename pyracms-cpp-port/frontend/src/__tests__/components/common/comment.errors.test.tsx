import { screen, fireEvent, waitFor } from '@testing-library/react'
import CommentItem from '@/components/common/comment/CommentItem'
import CommentForm from '@/components/common/comment/CommentForm'
import CommentSection from '@/components/common/comment/CommentSection'
import { makeUser } from '../../helpers/renderWithStore'
import { renderPlain } from '../../helpers/plainStore'
import type { Comment } from '@/components/common/comment/types'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(),
  },
}))
const m = api as unknown as Record<string, jest.Mock>
const boom = { response: { data: { error: 'boom' } } }
const refresh = jest.fn()
beforeEach(() => {
  Object.values(m).forEach((f) => f.mockReset().mockResolvedValue({}))
  refresh.mockReset()
})

const c: Comment = { id: 5, userId: 1, username: 'bob',
  contentType: 'a', contentId: 2, body: 'hello', parentId: null,
  likes: 0, dislikes: 0, createdAt: 'x', updatedAt: 'x', children: [] }
const item = () => renderPlain(
  <CommentItem comment={c} contentType="a" contentId={2} depth={1}
    onRefresh={refresh} />, makeUser())
const alert = () => screen.findByTestId('comment-action-error')

it('shows a vote failure', async () => {
  m.post!.mockRejectedValue(boom)
  item()
  fireEvent.click(screen.getByTestId('comment-upvote-btn'))
  expect(await alert()).toHaveTextContent('boom')
})

it('shows a save failure and none on success', async () => {
  m.put!.mockRejectedValueOnce(boom)
  item()
  fireEvent.click(screen.getByTestId('comment-edit-btn'))
  fireEvent.click(screen.getByTestId('comment-save-btn'))
  expect(await alert()).toHaveTextContent('boom')
  fireEvent.click(screen.getByTestId('comment-save-btn'))
  await waitFor(() => expect(
    screen.queryByTestId('comment-action-error')).toBeNull())
})

it('shows a delete failure', async () => {
  m.delete!.mockRejectedValue({})
  item()
  fireEvent.click(screen.getByTestId('comment-delete-btn'))
  fireEvent.click(screen.getByTestId('delete-comment-confirm-btn'))
  expect(await alert()).toHaveTextContent('Unable to connect')
})

it('shows a post failure', async () => {
  m.post!.mockRejectedValue(boom)
  renderPlain(<CommentForm contentType="a" contentId={1}
    onSubmitted={refresh} />)
  fireEvent.change(screen.getByTestId('comment-input')
    .querySelector('textarea')!, { target: { value: 'hi' } })
  fireEvent.click(screen.getByTestId('comment-submit-btn'))
  expect(await screen.findByTestId('comment-error'))
    .toHaveTextContent('boom')
  expect(refresh).not.toHaveBeenCalled()
})

it('shows a comments load failure', async () => {
  m.get!.mockRejectedValue(boom)
  renderPlain(<CommentSection contentType="a" contentId={1} />)
  expect(await screen.findByTestId('comments-error'))
    .toHaveTextContent('boom')
})
