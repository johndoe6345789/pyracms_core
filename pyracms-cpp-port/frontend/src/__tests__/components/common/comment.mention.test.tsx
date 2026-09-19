import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CommentForm, {
  insertMention,
} from '@/components/common/comment/CommentForm'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))
const post = api.post as jest.Mock
beforeEach(() => post.mockReset())

describe('insertMention', () => {
  const input = () =>
    screen.getByTestId('comment-input').querySelector('textarea')!

  it('replaces the trailing partial mention', () => {
    expect(insertMention('hi @al', 'alice')).toBe('hi @alice ')
    expect(insertMention('no token', 'bob')).toBe('no token')
  })

  it('posts parentId for replies', async () => {
    post.mockResolvedValue({})
    render(
      <CommentForm
        contentType="a"
        contentId={1}
        parentId={7}
        onSubmitted={jest.fn()}
      />,
    )
    fireEvent.change(input(), { target: { value: 'r' } })
    fireEvent.click(screen.getByTestId('comment-submit-btn'))
    await waitFor(() =>
      expect(post).toHaveBeenCalledWith('/api/comments/a/1', {
        body: 'r',
        parentId: 7,
      }),
    )
  })
})
