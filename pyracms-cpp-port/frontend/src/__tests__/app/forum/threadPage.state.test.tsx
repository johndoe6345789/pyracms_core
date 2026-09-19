import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ViewThreadPage } from '../../helpers/pages/ViewThreadPage'
import { tp, resetThreadPage } from '../../helpers/threadPageState'

jest.mock(
  'next/navigation',
  () => jest.requireActual('../../helpers/threadPageState').navMock,
)
jest.mock(
  '@/hooks/useTenantId',
  () => jest.requireActual('../../helpers/threadPageState').tenantMock,
)
jest.mock(
  '@/hooks/useForumUser',
  () => jest.requireActual('../../helpers/threadPageState').userMock,
)
jest.mock(
  '@/hooks/useThread',
  () => jest.requireActual('../../helpers/threadPageState').threadMock,
)
jest.mock(
  '@/hooks/useThreadLive',
  () => jest.requireActual('../../helpers/threadPageState').liveMock,
)

beforeEach(resetThreadPage)

it('shows loading and error states', () => {
  tp.tenantLoading = true
  const { rerender } = render(<ViewThreadPage />)
  expect(screen.getByTestId('forum-loading')).toBeInTheDocument()
  tp.tenantLoading = false
  tp.t.error = 'gone'
  rerender(<ViewThreadPage />)
  expect(screen.getByTestId('forum-error')).toHaveTextContent('gone')
})

it('shows typing, refreshes on new posts and submits', async () => {
  tp.t.replyContent = 'hello'
  tp.live = { typingUsers: [{ userId: 1 }] }
  render(<ViewThreadPage />)
  expect(screen.getByTestId('typing-indicator')).toBeInTheDocument()
  tp.onNewPost()
  expect(tp.refresh).toHaveBeenCalled()
  fireEvent.change(screen.getByTestId('quick-reply-input'), {
    target: { value: 'hey2' },
  })
  fireEvent.click(screen.getByTestId('quick-reply-submit'))
  await waitFor(() => expect(tp.t.handleSubmitReply).toHaveBeenCalled())
})
