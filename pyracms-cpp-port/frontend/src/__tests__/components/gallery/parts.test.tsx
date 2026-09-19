import { render, screen, fireEvent } from '@testing-library/react'
import AlbumHeader from '@/components/gallery/AlbumHeader'
import GalleryBreadcrumbs from '@/components/gallery/GalleryBreadcrumbs'
import PictureActions from '@/components/gallery/PictureActions'
import PictureFooter from '@/components/gallery/PictureFooter'
import PictureInfo from '@/components/gallery/PictureInfo'
import PictureViewer from '@/components/gallery/PictureViewer'
import VideoPlayer from '@/components/gallery/VideoPlayer'

describe('gallery parts', () => {
  it('AlbumHeader shows name/count and accepts files', () => {
    render(<AlbumHeader albumName="Trip" count={4} />)
    expect(screen.getByText('Trip')).toBeInTheDocument()
    expect(screen.getByText(/4 pictures in this album/)).toBeInTheDocument()
    fireEvent.change(screen.getByTestId('upload-file-input'), {
      target: { files: [] },
    })
  })

  it('GalleryBreadcrumbs shows album crumb only when given', () => {
    const { rerender } = render(
      <GalleryBreadcrumbs slug="s" label="l" testId="bc" current="Cur" />,
    )
    expect(screen.queryByText('Al')).toBeNull()
    rerender(
      <GalleryBreadcrumbs
        slug="s"
        label="l"
        testId="bc"
        current="Cur"
        albumName="Al"
        albumUrl="/a"
      />,
    )
    expect(screen.getByText('Al')).toHaveAttribute('href', '/a')
  })

  it('PictureActions fires callbacks', () => {
    const [c, e, d] = [jest.fn(), jest.fn(), jest.fn()]
    render(<PictureActions onSetCover={c} onEdit={e} onDelete={d} />)
    fireEvent.click(screen.getByTestId('set-cover-btn'))
    fireEvent.click(screen.getByTestId('edit-picture-btn'))
    fireEvent.click(screen.getByTestId('delete-picture-btn'))
    expect([c, e, d].every((f) => f.mock.calls.length === 1)).toBe(true)
  })

  it('PictureFooter wires actions', () => {
    const p = {
      onLike: jest.fn(),
      onDislike: jest.fn(),
      onSetCover: jest.fn(),
      onDelete: jest.fn(),
    }
    render(<PictureFooter likes={1} dislikes={2} {...p} />)
    fireEvent.click(screen.getByTestId('set-cover-btn'))
    fireEvent.click(screen.getByTestId('delete-picture-btn'))
    expect(p.onSetCover).toHaveBeenCalled()
    expect(p.onDelete).toHaveBeenCalled()
  })

  it('PictureInfo renders title, description, tags', () => {
    render(<PictureInfo title="T" description="D" tags={['x']} />)
    expect(screen.getByText('T')).toBeInTheDocument()
    expect(screen.getByText('D')).toBeInTheDocument()
  })

  it('PictureViewer switches image and video', () => {
    const { rerender } = render(
      <PictureViewer src="/a.png" title="A" isVideo={false} />,
    )
    expect(screen.getByAltText('A')).toBeInTheDocument()
    rerender(<PictureViewer src="/a.mp4" title="A" isVideo />)
    expect(screen.queryByAltText('A')).toBeNull()
  })

  it('VideoPlayer renders a source', () => {
    const { container } = render(<VideoPlayer src="/v.mp4" />)
    expect(container.querySelector('source')).toHaveAttribute('src', '/v.mp4')
  })
})
