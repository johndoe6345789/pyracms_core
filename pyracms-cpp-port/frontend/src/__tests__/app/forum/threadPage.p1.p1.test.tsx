import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ViewThreadPage } from '../../helpers/pages/ViewThreadPage'

const push = jest.fn()

const refresh = jest.fn()

const del = jest.fn().mockResolvedValue(undefined)

let tenantLoading = false

let live: { typingUsers: unknown[] } = { typingUsers: [] }

let onNewPost: () => void = () => {}

let t: Record<string, unknown> = {}

const thread = {
  title: 'Title',
  description: '',
  forumId: '3',
  forumName: 'F',
  pinned: false,
  locked: false,
  views: 0,
}

jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 's', threadId: '9' }),
  useRouter: () => ({ push }),
}))

jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 1, loading: tenantLoading }),
}))

jest.mock('@/hooks/useForumUser', () => ({
  useForumUser: () => ({ isAuthenticated: true, isModerator: true }),
}))

jest.mock('@/hooks/useThread', () => ({ useThread: () => t }))

jest.mock('@/hooks/useThreadLive', () => ({
  useThreadLive: (o: { onNewPost: () => void }) => {
    onNewPost = o.onNewPost
    return { ...live, sendTypingStart: jest.fn() }
  },
}))

beforeEach(() => {
  push.mockClear()
  tenantLoading = false
  live = { typingUsers: [] }
  t = {
    thread,
    posts: [],
    loading: false,
    error: '',
    refresh,
    replyContent: '',
    setReplyContent: jest.fn(),
    replyError: '',
    submitting: false,
    handleSubmitReply: jest.fn().mockResolvedValue(0),
    handleDeleteThread: del,
    handleTogglePin: jest.fn(),
    handleToggleLock: jest.fn(),
    handleVotePost: jest.fn(),
    handleEditPost: jest.fn(),
    handleDeletePost: jest.fn(),
    handleQuote: jest.fn(),
  }
})

it('shows loading and error states', () => {
  tenantLoading = true
  const { rerender } = render(<ViewThreadPage />)
  expect(screen.getByTestId('forum-loading')).toBeInTheDocument()
  tenantLoading = false
  t.error = 'gone'
  rerender(<ViewThreadPage />)
  expect(screen.getByTestId('forum-error')).toHaveTextContent('gone')
})

it('shows typing, refreshes on new posts and submits', async () => {
  t.replyContent = 'hello'
  live = { typingUsers: [{ userId: 1 }] }
  render(<ViewThreadPage />)
  expect(screen.getByTestId('typing-indicator')).toBeInTheDocument()
  onNewPost()
  expect(refresh).toHaveBeenCalled()
  fireEvent.change(screen.getByTestId('quick-reply-input'), {
    target: { value: 'hey2' },
  })
  fireEvent.click(screen.getByTestId('quick-reply-submit'))
  await waitFor(() => expect(t.handleSubmitReply).toHaveBeenCalled())
})
