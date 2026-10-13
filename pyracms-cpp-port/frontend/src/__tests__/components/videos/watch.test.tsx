import { fireEvent, screen } from '@testing-library/react'
import WatchDetails from '@/components/videos/WatchDetails'
import { makeVideo } from '../../helpers/videoFixture'
import { makeUser, renderWithStore } from '../../helpers/renderWithStore'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(() => Promise.resolve({ data: { items: [] } })) },
}))

const show = (over: object, canVote = false, signedIn = false) => {
  const h = { onVote: jest.fn(), onEdit: jest.fn(), onDelete: jest.fn() }
  renderWithStore(
    <WatchDetails
      slug="s"
      video={makeVideo(over)}
      canVote={canVote}
      canManage={canVote}
      {...h}
    />,
    signedIn ? makeUser() : undefined,
  )
  return h
}

it('plays the file with its poster and shows the active vote', async () => {
  const h = show({ myVote: 'like' }, true, true)
  const player = screen.getByTestId('video-player')
  expect(player.getAttribute('src')).toMatch(/\/api\/files\/f-1$/)
  expect(player.getAttribute('poster')).toMatch(/\/api\/files\/t-1$/)
  expect(screen.getByTestId('video-like')).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  fireEvent.click(screen.getByTestId('video-dislike'))
  expect(h.onVote).toHaveBeenCalledWith(false)
  fireEvent.click(screen.getByTestId('video-edit-btn'))
  fireEvent.click(screen.getByTestId('video-delete-btn'))
  expect(h.onEdit).toHaveBeenCalled()
  expect(h.onDelete).toHaveBeenCalled()
  expect(await screen.findByText('Subscribe')).toBeInTheDocument()
  expect(api.get).toHaveBeenCalledWith('/api/users/2/followers?limit=100')
  expect(screen.getByTestId('video-channel-link')).toHaveAttribute(
    'href',
    '/site/s/videos/channel/2',
  )
})

it('guests see counts only, and no poster without a still', () => {
  show({ thumbnailUuid: '', likes: 1500 })
  expect(screen.getByTestId('video-player')).not.toHaveAttribute('poster')
  expect(screen.getByTestId('video-like')).toBeDisabled()
  expect(screen.getByTestId('video-like')).toHaveTextContent('1.5K')
  expect(screen.queryByTestId('video-edit-btn')).toBeNull()
  expect(screen.queryByText('Subscribe')).toBeNull()
})

it('expands a long description', () => {
  const description = 'line\n'.repeat(6)
  show({ description })
  expect(screen.getByTestId('video-description')).toHaveTextContent(
    '1.2K views · 2026-09-20',
  )
  const toggle = screen.getByTestId('video-description-toggle')
  fireEvent.click(toggle)
  expect(toggle).toHaveTextContent('Show less')
})
