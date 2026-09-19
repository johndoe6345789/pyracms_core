import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import AlbumPage from '@/app/site/[slug]/(tenant)/gallery/[albumId]/page'
import PicturePage
  from '@/app/site/[slug]/(tenant)/gallery/picture/[pictureId]/page'

const push = jest.fn()
jest.mock('@/components/common/CommentSection',
  () => require('../helpers/commentMock').commentSectionMock())
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useParams: () => ({ slug: 's', albumId: '4', pictureId: '9' }),
}))
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 1 }),
}))
jest.mock('@/hooks/useSiteSession', () => ({ useSiteSession: () => true }))
let manage = true
jest.mock('@/hooks/useCanManage', () => ({ useCanManage: () => manage }))
jest.mock('@/lib/api', () => ({
  __esModule: true, default: { put: jest.fn(), delete: jest.fn() },
}))
jest.mock('@/hooks/useGalleryAlbum', () => ({
  useGalleryAlbum: () => ({ albumName: 'Trip', albumDescription: 'd',
    ownerId: 1, refresh: jest.fn(), pictures: [] }),
}))
jest.mock('@/hooks/useGalleryPicture', () => ({
  useGalleryPicture: () => ({ handleLike: jest.fn(),
    handleDislike: jest.fn(), handleSetCover: jest.fn(),
    refresh: jest.fn(), picture: { title: 'Pic', description: 'd',
      src: '/s', tags: [], likes: 1, dislikes: 0, isVideo: false,
      albumId: '4', albumName: 'Trip', ownerId: 1 } }),
}))

describe('gallery owner controls', () => {
  beforeEach(() => { manage = true })
  it('deletes a picture after confirmation', async () => {
    ;(api.delete as jest.Mock).mockResolvedValue({})
    render(<PicturePage />)
    expect(screen.getByTestId('comments-picture-9')).toBeVisible()
    fireEvent.click(screen.getByTestId('set-cover-btn'))
    fireEvent.click(screen.getByTestId('delete-picture-btn'))
    fireEvent.click(await screen.findByTestId('gallery-delete-confirm'))
    await waitFor(() => expect(push).toHaveBeenCalledWith(
      '/site/s/gallery/4'))
    expect(api.delete).toHaveBeenCalledWith('/api/gallery/pictures/9')
  })

  it('hides picture and album controls from non-owners', () => {
    manage = false
    render(<PicturePage />)
    expect(screen.queryByTestId('delete-picture-btn')).toBeNull()
    render(<AlbumPage />)
    expect(screen.queryByTestId('edit-album-btn')).toBeNull()
    manage = true
  })

  it('offers album edit and delete to owners', () => {
    render(<AlbumPage />)
    expect(screen.getByTestId('edit-album-btn')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('delete-album-btn'))
    expect(screen.getByTestId('gallery-delete-dialog')).toBeInTheDocument()
  })
})
