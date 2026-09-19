import { screen, fireEvent, waitFor } from '@testing-library/react'
import { m, boom, resetApi, show } from '../../helpers/commentItemHelpers'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)
beforeEach(resetApi)
const alert = () => screen.findByTestId('comment-action-error')

it('shows a vote failure', async () => {
  m.post.mockRejectedValue(boom)
  show()
  fireEvent.click(screen.getByTestId('comment-upvote-btn'))
  expect(await alert()).toHaveTextContent('boom')
})

it('shows a save failure and none on success', async () => {
  m.put.mockRejectedValueOnce(boom)
  show()
  fireEvent.click(screen.getByTestId('comment-edit-btn'))
  fireEvent.click(screen.getByTestId('comment-save-btn'))
  expect(await alert()).toHaveTextContent('boom')
  fireEvent.click(screen.getByTestId('comment-save-btn'))
  await waitFor(() =>
    expect(screen.queryByTestId('comment-action-error')).toBeNull(),
  )
})

it('shows a delete failure', async () => {
  m.delete.mockRejectedValue({})
  show()
  fireEvent.click(screen.getByTestId('comment-delete-btn'))
  fireEvent.click(screen.getByTestId('delete-comment-confirm-btn'))
  expect(await alert()).toHaveTextContent('Unable to connect')
})
