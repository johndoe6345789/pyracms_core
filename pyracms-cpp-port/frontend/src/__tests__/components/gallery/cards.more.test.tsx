import { render, screen } from '@testing-library/react'
import AlbumCard from '@/components/gallery/AlbumCard'
import PictureGrid from '@/components/gallery/PictureGrid'
import TagCloudChips from '@/components/gallery/TagCloudChips'
import { album } from '../../helpers/galleryAlbum'

describe('gallery cards', () => {
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

  it('TagCloudChips renders sized, linked tags', () => {
    render(
      <TagCloudChips
        items={[
          {
            name: 'a',
            count: 3,
            articles: 2,
            snippets: 1,
            weight: 0.5,
            href: '/t/a',
            fontSize: 12,
            height: 20,
          } as never,
        ]}
      />,
    )
    const chip = screen.getByTestId('tag-cloud-chip-a')
    expect(chip).toHaveTextContent('a3')
    expect(chip).toHaveAttribute('title', '2 articles, 1 snippet')
    expect(chip).toHaveAttribute('href', '/t/a')
  })
})
