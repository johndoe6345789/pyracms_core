import { screen, fireEvent } from '@testing-library/react'
import { FollowButton } from '@/components/users/FollowButton'
import { renderWithStore, makeUser } from '../../helpers/renderWithStore'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}))
const m = api as unknown as Record<string, jest.Mock>

it('can read Subscribe / Subscribed', async () => {
  m.get!.mockResolvedValue({ data: { items: [] } })
  m.post!.mockResolvedValue({})
  renderWithStore(
    <FollowButton
      userId={2}
      followLabel="Subscribe"
      unfollowLabel="Subscribed"
    />,
    makeUser(),
  )
  fireEvent.click(await screen.findByText('Subscribe'))
  expect(await screen.findByText('Subscribed')).toBeInTheDocument()
  expect(m.post).toHaveBeenCalledWith('/api/users/2/follow')
})
