import { screen, fireEvent } from '@testing-library/react'
import CommentForm from '@/components/common/comment/CommentForm'
import CommentSection from '@/components/common/comment/CommentSection'
import { renderPlain } from '../../helpers/plainStore'
import { m, boom, refresh, resetApi } from '../../helpers/commentItemHelpers'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)
beforeEach(resetApi)

it('shows a post failure', async () => {
  m.post.mockRejectedValue(boom)
  renderPlain(
    <CommentForm contentType="a" contentId={1} onSubmitted={refresh} />,
  )
  fireEvent.change(
    screen.getByTestId('comment-input').querySelector('textarea')!,
    { target: { value: 'hi' } },
  )
  fireEvent.click(screen.getByTestId('comment-submit-btn'))
  expect(await screen.findByTestId('comment-error')).toHaveTextContent('boom')
  expect(refresh).not.toHaveBeenCalled()
})

it('shows a comments load failure', async () => {
  m.get.mockRejectedValue(boom)
  renderPlain(<CommentSection contentType="a" contentId={1} />)
  expect(await screen.findByTestId('comments-error')).toHaveTextContent('boom')
})
