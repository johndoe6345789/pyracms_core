import { screen, waitFor } from '@testing-library/react'
import CommentSection from '@/components/common/CommentSection'
import { makeUser } from '../../helpers/renderWithStore'
import { renderPlain as renderWithStore } from '../../helpers/plainStore'
import { m } from '../../helpers/scopeApi'
import { flat } from '../../helpers/commentTreeFixture'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)
beforeEach(() => Object.values(m).forEach((f) => f.mockReset()))

describe('CommentSection', () => {
  it('loads comments for guests without a form', async () => {
    m.get.mockResolvedValue({ data: [flat(1), flat(2, 1)] })
    renderWithStore(<CommentSection contentType="a" contentId={1} />)
    expect(await screen.findByText('c1')).toBeInTheDocument()
    expect(screen.getByText('c2')).toBeInTheDocument()
    expect(screen.queryByTestId('comment-input')).toBeNull()
    expect(screen.getByTestId('comment-login-hint')).toHaveTextContent(
      'Sign in to comment',
    )
  })

  it('shows the form when signed in and survives errors', async () => {
    m.get.mockRejectedValue(new Error('x'))
    renderWithStore(
      <CommentSection contentType="a" contentId={1} />,
      makeUser(),
    )
    expect(await screen.findByTestId('comment-input')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByText(/Be the first/)).toBeInTheDocument(),
    )
  })

  it('handles a non-array response', async () => {
    m.get.mockResolvedValue({ data: {} })
    renderWithStore(<CommentSection contentType="a" contentId={1} />)
    expect(await screen.findByText(/Be the first/)).toBeInTheDocument()
  })
})
