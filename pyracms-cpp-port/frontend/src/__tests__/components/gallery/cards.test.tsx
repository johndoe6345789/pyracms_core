import { render, screen } from '@testing-library/react'
import AlbumCard from '@/components/gallery/AlbumCard'
import AlbumGrid from '@/components/gallery/AlbumGrid'
import PictureGrid from '@/components/gallery/PictureGrid'
import { album } from '../../helpers/galleryAlbum'

describe('gallery cards', () => {
  it('AlbumCard links to the album', () => {
    render(<AlbumCard album={album} slug="s" />)
    expect(screen.getByTestId('album-link-3')).toHaveAttribute(
      'href',
      '/site/s/gallery/3',
    )
    expect(screen.getByText('7 pictures')).toBeInTheDocument()
    expect(
      screen.getByAltText('Cover image for album Trip'),
    ).toBeInTheDocument()
  })

  it('AlbumGrid renders one card per album', () => {
    render(
      <AlbumGrid
        slug="s"
        albums={[album, { ...(album as object), id: 4 } as never]}
      />,
    )
    expect(screen.getByTestId('album-grid')).toBeInTheDocument()
    expect(screen.getByTestId('album-card-4')).toBeInTheDocument()
  })

  it('PictureGrid renders picture links', () => {
    render(
      <PictureGrid
        slug="s"
        pictures={[{ id: 9, src: '/p.png', title: 'Pic' } as never]}
      />,
    )
    expect(screen.getByTestId('picture-item-9')).toHaveAttribute(
      'href',
      '/site/s/gallery/picture/9',
    )
    expect(screen.getByAltText('Pic')).toBeInTheDocument()
  })
})
