import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import WatchPage from '@/app/site/[slug]/(tenant)/videos/watch/[videoId]/page'
import { makeVideo } from '../../helpers/videoFixture'
import { list, push, state, video } from '../../helpers/videoPagesMocks'

function mockH() {
  return jest.requireActual('../../helpers/videoPagesMocks')
}
jest.mock('next/navigation', () => mockH().navMock)
jest.mock('@/hooks/useTenantId', () => mockH().tenantMock)
jest.mock('@/hooks/useSiteSession', () => mockH().sessionMock)
jest.mock('@/hooks/useCanManage', () => mockH().manageMock)
jest.mock('@/hooks/useVideoList', () => mockH().listMock)
jest.mock('@/hooks/useVideo', () => mockH().videoMock)
jest.mock('@/components/users/FollowButton', () => ({
  FollowButton: () => null,
}))
jest.mock('@/components/common/CommentSection', () =>
  jest.requireActual('../../helpers/commentMock').commentSectionMock(),
)

beforeEach(() => {
  state.video = makeVideo()
  state.missing = false
})

it('plays the video with comments and other videos up next', () => {
  render(<WatchPage />)
  expect(screen.getByTestId('video-player')).toBeInTheDocument()
  expect(screen.getByTestId('comments-video-7')).toBeInTheDocument()
  expect(screen.getByTestId('up-next-8')).toBeInTheDocument()
  expect(screen.queryByTestId('up-next-7')).toBeNull()
  expect(list.calls.at(-1)).toEqual([1, { sort: 'popular', limit: 10 }])
})

it('votes and shows a failed vote', async () => {
  video.vote.mockRejectedValueOnce({ response: { data: { error: 'Slow' } } })
  render(<WatchPage />)
  fireEvent.click(screen.getByTestId('video-like'))
  expect(video.vote).toHaveBeenCalledWith(true)
  expect(await screen.findByTestId('video-error')).toHaveTextContent('Slow')
})

it('edits the video', async () => {
  video.update.mockResolvedValue(undefined)
  render(<WatchPage />)
  fireEvent.click(screen.getByTestId('video-edit-btn'))
  fireEvent.change(screen.getByTestId('video-title-input'), {
    target: { value: 'Renamed' },
  })
  fireEvent.click(screen.getByTestId('video-edit-save'))
  await waitFor(() =>
    expect(video.update).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Renamed' }),
    ),
  )
})

it('deletes and goes back to the videos', async () => {
  video.remove.mockResolvedValue({})
  render(<WatchPage />)
  fireEvent.click(screen.getByTestId('video-delete-btn'))
  fireEvent.click(screen.getByTestId('gallery-delete-confirm'))
  await waitFor(() => expect(push).toHaveBeenCalledWith('/site/s/videos'))
})

it('says when a video is not available, and waits while loading', () => {
  state.missing = true
  const { unmount } = render(<WatchPage />)
  expect(screen.getByTestId('video-missing')).toBeInTheDocument()
  unmount()
  state.missing = false
  state.video = null
  const { container } = render(<WatchPage />)
  expect(container).toBeEmptyDOMElement()
})
