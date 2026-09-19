import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import GalleryPage from '@/app/site/[slug]/(tenant)/gallery/page'
import AlbumPage from '@/app/site/[slug]/(tenant)/gallery/[albumId]/page'
import PicturePage
  from '@/app/site/[slug]/(tenant)/gallery/picture/[pictureId]/page'

const push = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useParams: () => ({ slug: 's', albumId: '4', pictureId: '9' }),
}))
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 1 }),
}))
let signedIn = false
jest.mock('@/hooks/useSiteSession', () => ({
  useSiteSession: () => signedIn,
}))
jest.mock('@/hooks/useGalleryAlbums', () => ({
  useGalleryAlbums: () => ({ albums: [{ id: '1', name: 'A',
    coverImage: '/c', pictureCount: 2 }] }),
}))
jest.mock('@/hooks/useGalleryAlbum', () => ({
  useGalleryAlbum: () => ({ albumName: 'Trip', pictures: [
    { id: '1', title: 'P', src: '/p' }] }),
}))
const pic = { title: 'Pic', description: 'd', src: '/s', tags: [],
  likes: 1, dislikes: 0, isVideo: false, albumId: '4', albumName: 'Trip' }
const h = { picture: pic as unknown, handleLike: jest.fn(),
  handleDislike: jest.fn(), handleSetCover: jest.fn(),
  handleDelete: jest.fn() }
jest.mock('@/hooks/useGalleryPicture', () => ({
  useGalleryPicture: () => h,
}))
let tags = { items: [] as unknown[], loading: false }
jest.mock('@/hooks/useTagCloudPage', () => ({
  useTagCloudPage: () => tags,
}))

describe('gallery pages', () => {
  it('lists albums', () => {
    render(<GalleryPage />)
    expect(screen.getByTestId('gallery-page')).toBeInTheDocument()
    expect(screen.getByTestId('album-card-1')).toBeInTheDocument()
    expect(screen.queryByTestId('create-album-btn')).toBeNull()
  })

  it('shows an album', () => {
    render(<AlbumPage />)
    expect(screen.getAllByText('Trip').length).toBeGreaterThan(0)
    expect(screen.getByTestId('picture-item-1')).toBeInTheDocument()
  })

  it('shows a picture and deletes it', async () => {
    h.handleSetCover.mockResolvedValue({})
    h.handleDelete.mockResolvedValue({})
    render(<PicturePage />)
    fireEvent.click(screen.getByTestId('set-cover-btn'))
    fireEvent.click(screen.getByTestId('delete-picture-btn'))
    await waitFor(() => expect(push).toHaveBeenCalledWith(
      '/site/s/gallery/4'))
  })

  it('swallows picture action failures', async () => {
    h.handleSetCover.mockRejectedValue(new Error('x'))
    h.handleDelete.mockRejectedValue(new Error('x'))
    render(<PicturePage />)
    fireEvent.click(screen.getByTestId('set-cover-btn'))
    fireEvent.click(screen.getByTestId('delete-picture-btn'))
    await waitFor(() => expect(h.handleDelete).toHaveBeenCalled())
  })

  it('renders nothing before the picture loads', () => {
    h.picture = null
    const { container } = render(<PicturePage />)
    expect(container).toBeEmptyDOMElement()
    h.picture = pic
  })
})
