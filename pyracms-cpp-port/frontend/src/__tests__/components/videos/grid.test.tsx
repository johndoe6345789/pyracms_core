import { fireEvent, render, screen } from '@testing-library/react'
import VideoGrid from '@/components/videos/VideoGrid'
import VideoThumb from '@/components/videos/VideoThumb'
import { makeVideo } from '../../helpers/videoFixture'

describe('VideoThumb', () => {
  it('shows the still and running time', () => {
    render(<VideoThumb thumbnailUuid="t-1" title="Cat" durationSeconds={75} />)
    expect(screen.getByAltText('Cat')).toHaveAttribute(
      'src',
      expect.stringMatching(/\/api\/files\/t-1$/),
    )
    expect(screen.getByTestId('video-duration')).toHaveTextContent('1:15')
  })

  it('falls back to a play tile and hides an unknown duration', () => {
    render(<VideoThumb thumbnailUuid="" title="Cat" durationSeconds={0} />)
    expect(screen.getByTestId('video-thumb-placeholder')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'Cat' })).toBeNull()
    expect(screen.queryByTestId('video-duration')).toBeNull()
  })
})

describe('VideoGrid', () => {
  const props = { slug: 's', loading: false, hasMore: false, onMore: jest.fn() }

  it('lists cards linking to the video and the channel', () => {
    const items = [makeVideo(), makeVideo({ id: 8, visibility: 'private' })]
    render(<VideoGrid {...props} items={items} />)
    expect(
      screen.getAllByRole('link', { name: 'Cat video' })[0],
    ).toHaveAttribute('href', '/site/s/videos/watch/7')
    expect(screen.getByTestId('video-channel-7')).toHaveAttribute(
      'href',
      '/site/s/videos/channel/2',
    )
    expect(screen.getByTestId('video-card-7')).toHaveTextContent('1.2K views')
    expect(screen.getByText('Private')).toBeInTheDocument()
    expect(screen.queryByTestId('videos-load-more')).toBeNull()
  })

  it('loads more on demand', () => {
    const onMore = jest.fn()
    render(
      <VideoGrid {...props} items={[makeVideo()]} hasMore onMore={onMore} />,
    )
    fireEvent.click(screen.getByTestId('videos-load-more'))
    expect(onMore).toHaveBeenCalled()
  })

  it('has an empty state, with a custom message', () => {
    const { rerender } = render(<VideoGrid {...props} items={[]} />)
    expect(screen.getByText('No videos yet.')).toBeInTheDocument()
    rerender(<VideoGrid {...props} items={[]} empty="Nothing here" />)
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
    rerender(<VideoGrid {...props} items={[]} loading />)
    expect(screen.queryByTestId('videos-empty')).toBeNull()
  })
})
