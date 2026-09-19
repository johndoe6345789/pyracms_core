import { render, screen } from '@testing-library/react'
import AlbumCard from '@/components/gallery/AlbumCard'
import AlbumGrid from '@/components/gallery/AlbumGrid'
import PictureGrid from '@/components/gallery/PictureGrid'
import TagCloudChips from '@/components/gallery/TagCloudChips'

const album = {
  id: 3,
  name: 'Trip',
  coverImage: '/c.png',
  pictureCount: 7,
} as never

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

  it('shows no fake image for covers and pictures without one', () => {
    render(
      <AlbumCard
        album={{ ...(album as object), coverImage: '' } as never}
        slug="s"
      />,
    )
    expect(screen.getByTestId('album-no-cover')).toBeInTheDocument()
    render(
      <PictureGrid
        slug="s"
        pictures={[{ id: 8, src: '', title: 'Nada' } as never]}
      />,
    )
    expect(screen.getByTestId('picture-missing-8')).toHaveTextContent('Nada')
  })

  it('TagCloudChips renders labelled chips', () => {
    render(
      <TagCloudChips
        items={[
          {
            name: 'a',
            count: 2,
            href: '/t/a',
            fontSize: 12,
            height: 20,
          } as never,
        ]}
      />,
    )
    const chip = screen.getByTestId('tag-cloud-chip-a')
    expect(chip).toHaveTextContent('a (2)')
    expect(chip).toHaveAttribute('href', '/t/a')
  })
})
