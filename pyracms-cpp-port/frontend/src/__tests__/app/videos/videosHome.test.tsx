import { fireEvent, render, screen } from '@testing-library/react'
import VideosPage from '@/app/site/[slug]/(tenant)/videos/page'
import ChannelPage from '../../helpers/pages/VideoChannelPage'
import VideosLayout from '@/app/site/[slug]/(tenant)/videos/layout'
import { list, state } from '../../helpers/videoPagesMocks'

function mockH() {
  return jest.requireActual('../../helpers/videoPagesMocks')
}
jest.mock('next/navigation', () => mockH().navMock)
jest.mock('@/hooks/useTenantId', () => mockH().tenantMock)
jest.mock('@/hooks/useSiteSession', () => mockH().sessionMock)
jest.mock('@/hooks/useVideoList', () => mockH().listMock)
jest.mock('@/hooks/useChannelName', () => mockH().channelMock)
jest.mock('@/components/users/FollowButton', () => ({
  FollowButton: (p: { followLabel: string }) => (
    <button>{p.followLabel}</button>
  ),
}))
jest.mock('@/components/common/FeatureGuard', () => ({
  __esModule: true,
  default: (p: { feature: string; children: React.ReactNode }) => (
    <div data-testid={`guard-${p.feature}`}>{p.children}</div>
  ),
}))

beforeEach(() => (list.calls = []))

it('guards the module behind the videos feature', () => {
  render(<VideosLayout>hi</VideosLayout>)
  expect(screen.getByTestId('guard-videos')).toHaveTextContent('hi')
})

it('lists, sorts and searches videos', () => {
  render(<VideosPage />)
  expect(screen.getByTestId('video-card-8')).toBeInTheDocument()
  expect(list.calls.at(-1)).toEqual([1, { sort: 'newest', q: '' }])
  fireEvent.click(screen.getByRole('button', { name: 'Popular' }))
  expect(list.calls.at(-1)).toEqual([1, { sort: 'popular', q: '' }])
  fireEvent.change(screen.getByLabelText('Search videos'), {
    target: { value: 'zzz' },
  })
  fireEvent.submit(screen.getByRole('search'))
  expect(list.calls.at(-1)).toEqual([1, { sort: 'popular', q: 'zzz' }])
})

it('says when a search finds nothing', () => {
  state.items = []
  render(<VideosPage />)
  fireEvent.change(screen.getByLabelText('Search videos'), {
    target: { value: 'zzz' },
  })
  fireEvent.submit(screen.getByRole('search'))
  expect(screen.getByText('No videos match "zzz".')).toBeInTheDocument()
})

it('shows a channel with its videos and Subscribe', () => {
  render(<ChannelPage />)
  expect(screen.getByTestId('channel-header')).toHaveTextContent('bob')
  expect(screen.getByText('Subscribe')).toBeInTheDocument()
  expect(list.calls.at(-1)).toEqual([1, { userId: 2, sort: 'newest' }])
  expect(screen.getByText('This channel has no videos yet.')).toBeTruthy()
})

it('names the channel from its videos when the profile is hidden', () => {
  state.channel = ''
  state.items = [
    jest.requireActual('../../helpers/videoFixture').makeVideo({
      username: 'carol',
    }),
  ]
  render(<ChannelPage />)
  expect(screen.getByRole('heading', { name: 'carol' })).toBeInTheDocument()
})
