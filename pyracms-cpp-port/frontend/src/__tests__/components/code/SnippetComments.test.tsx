import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import { SnippetComments } from '@/components/code/SnippetComments'
import { asMockApi } from '../../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}))
const mock = asMockApi<'get' | 'post'>(api)

const input = () =>
  screen.getByTestId('comment-input').querySelector('textarea')!

beforeEach(() => {
  mock.get.mockReset()
  mock.post.mockReset()
})

it('shows existing comments', async () => {
  mock.get.mockResolvedValue({ data: [
    { id: 1, username: 'ann', body: 'nice', createdAt: '2024-01-01T10:00:00' },
  ] })
  render(<SnippetComments id="4" />)
  expect(await screen.findByTestId('comment-1')).toHaveTextContent('nice')
  expect(screen.getByText('Comments (1)')).toBeInTheDocument()
})

it('shows an empty state', async () => {
  mock.get.mockResolvedValue({ data: [] })
  render(<SnippetComments id="4" />)
  expect(await screen.findByTestId('no-comments')).toBeInTheDocument()
})

it('posts a comment, reloads and clears the box', async () => {
  mock.get.mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({
    data: [{ id: 2, username: 'me', body: 'yo' }],
  })
  mock.post.mockResolvedValue({})
  render(<SnippetComments id="4" />)
  await screen.findByTestId('no-comments')
  expect(screen.getByTestId('post-comment-btn')).toBeDisabled()
  fireEvent.change(input(), { target: { value: ' yo ' } })
  fireEvent.click(screen.getByTestId('post-comment-btn'))
  await screen.findByTestId('comment-2')
  expect(mock.post).toHaveBeenCalledWith('/api/comments/snippet/4', {
    body: 'yo',
  })
  await waitFor(() => expect(input().value).toBe(''))
})

it('keeps the text and shows an error when posting fails', async () => {
  mock.get.mockResolvedValue({ data: [] })
  mock.post.mockRejectedValue({ response: { status: 401 } })
  render(<SnippetComments id="4" />)
  await screen.findByTestId('no-comments')
  fireEvent.change(input(), { target: { value: 'yo' } })
  fireEvent.click(screen.getByTestId('post-comment-btn'))
  expect(await screen.findByTestId('comment-error'))
    .toHaveTextContent(/Log in/)
  expect(input().value).toBe('yo')
})
