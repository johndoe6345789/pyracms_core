import { render, screen, fireEvent } from '@testing-library/react'
import AlbumHeader from '@/components/gallery/AlbumHeader'
import PictureViewer from '@/components/gallery/PictureViewer'

describe('gallery manage parts', () => {
  it('AlbumHeader shows owner controls only when given', () => {
    const [e, d] = [jest.fn(), jest.fn()]
    const { rerender } = render(<AlbumHeader albumName="T" count={1} />)
    expect(screen.queryByTestId('edit-album-btn')).toBeNull()
    rerender(<AlbumHeader albumName="T" count={1} onEdit={e} onDelete={d} />)
    fireEvent.click(screen.getByTestId('edit-album-btn'))
    fireEvent.click(screen.getByTestId('delete-album-btn'))
    expect(e).toHaveBeenCalled()
    expect(d).toHaveBeenCalled()
  })

  it('shows honest placeholders when pictures have no image', () => {
    render(<PictureViewer src="" title="A" isVideo={false} />)
    expect(screen.getByTestId('picture-missing')).toBeInTheDocument()
  })
})
