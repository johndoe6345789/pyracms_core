import { render, screen } from '@testing-library/react'
import GalleryHero from '@/components/gallery/GalleryHero'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

it('shows the featured photo as a link to its page', () => {
  render(
    <GalleryHero
      slug="s"
      photo={{ id: '9', title: 'Dawn', albumName: 'Trip', src: '/x.jpg' }}
    />,
  )
  const hero = screen.getByTestId('gallery-hero')
  expect(hero).toHaveAttribute('href', '/site/s/gallery/picture/9')
  expect(hero).toHaveTextContent('Dawn')
  expect(hero).toHaveTextContent('From Trip')
})
