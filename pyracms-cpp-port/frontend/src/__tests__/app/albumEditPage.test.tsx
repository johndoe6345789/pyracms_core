import { render, screen } from '@testing-library/react'
import Page from '@/app/site/[slug]/(tenant)/gallery/[albumId]/edit/page'

let can = true
const album = {
  albumName: 'Trip',
  albumDescription: 'd',
  ownerId: 7,
  options: {
    isPrivate: false,
    sortOrder: 'newest',
    coverMode: 'random',
    coverPictureId: 0,
  },
  pictures: [],
  refresh: jest.fn(),
}
jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 's', albumId: '3' }),
}))
jest.mock('@/hooks/useCanManage', () => ({ useCanManage: () => can }))
jest.mock('@/hooks/useGalleryAlbum', () => ({ useGalleryAlbum: () => album }))

it('lets the owner edit details, cover and photos', () => {
  can = true
  render(<Page />)
  expect(screen.getByTestId('album-title-input')).toHaveValue('Trip')
  expect(screen.getByLabelText('Random photo')).toBeChecked()
  expect(screen.getByTestId('photo-list')).toBeInTheDocument()
})

it('tells others they cannot edit', () => {
  can = false
  render(<Page />)
  expect(screen.getByText(/Only the album/)).toBeInTheDocument()
  expect(screen.queryByTestId('album-title-input')).toBeNull()
})
