import { fireEvent, render, screen } from '@testing-library/react'
import ChannelHeader from '@/components/videos/ChannelHeader'
import UpNext from '@/components/videos/UpNext'
import VideoDescription from '@/components/videos/VideoDescription'
import { makeVideo } from '../../helpers/videoFixture'
import { renderWithStore } from '../../helpers/renderWithStore'

it('lists the next videos linking to their pages', () => {
  render(<UpNext slug="s" items={[makeVideo({ id: 9, title: 'Dog' })]} />)
  expect(screen.getByTestId('up-next-9')).toHaveAttribute(
    'href',
    '/site/s/videos/watch/9',
  )
  expect(screen.getByTestId('video-up-next')).toHaveTextContent('Dog')
})

it('hides Up next when there is nothing', () => {
  const { container } = render(<UpNext slug="s" items={[]} />)
  expect(container).toBeEmptyDOMElement()
})

it('shows the channel name and video count', () => {
  renderWithStore(<ChannelHeader userId={2} username="bob" total={1} />)
  expect(screen.getByTestId('channel-header')).toHaveTextContent('bob1 video')
})

it('channel header falls back to a generic title', () => {
  renderWithStore(<ChannelHeader userId={2} username="" total={3} />)
  expect(screen.getByText('Channel')).toBeInTheDocument()
  expect(screen.getByText('3 videos')).toBeInTheDocument()
})

it('short descriptions need no toggle, empty ones show only stats', () => {
  const { rerender } = render(
    <VideoDescription viewCount={1} createdAt="" description="Hi" />,
  )
  expect(screen.getByText('Hi')).toBeInTheDocument()
  expect(screen.queryByTestId('video-description-toggle')).toBeNull()
  rerender(<VideoDescription viewCount={1} createdAt="" description="" />)
  expect(screen.getByTestId('video-description')).toHaveTextContent('1 view')
  rerender(
    <VideoDescription
      viewCount={1}
      createdAt=""
      description={'x'.repeat(201)}
    />,
  )
  fireEvent.click(screen.getByTestId('video-description-toggle'))
  expect(screen.getByText('Show less')).toBeInTheDocument()
})
