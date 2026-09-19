import { screen, fireEvent, waitFor } from '@testing-library/react'
import { FollowButton } from '@/components/users/FollowButton'
import { renderWithStore, makeUser } from '../../helpers/renderWithStore'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}))
const m = api as unknown as Record<string, jest.Mock>
const boom = { response: { data: { error: 'boom' } } }
beforeEach(() => {
  Object.values(m).forEach((f) => f.mockReset())
  m.get!.mockResolvedValue({ data: { items: [] } })
})

it('shows a follow failure and clears it on success', async () => {
  m.post!.mockRejectedValueOnce(boom).mockResolvedValue({})
  renderWithStore(<FollowButton userId={2} />, makeUser())
  fireEvent.click(await screen.findByText('Follow'))
  expect(await screen.findByTestId('follow-error')).toHaveTextContent('boom')
  expect(screen.getByText('Follow')).toBeInTheDocument()
  fireEvent.click(screen.getByText('Follow'))
  await waitFor(() => expect(screen.queryByTestId('follow-error')).toBeNull())
  expect(await screen.findByText('Unfollow')).toBeInTheDocument()
})
