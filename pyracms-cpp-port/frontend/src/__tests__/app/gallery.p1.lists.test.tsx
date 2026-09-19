import { render, screen } from '@testing-library/react'
import GalleryPage from '@/app/site/[slug]/(tenant)/gallery/page'
import AlbumPage from '@/app/site/[slug]/(tenant)/gallery/[albumId]/page'

jest.mock('@/components/common/CommentSection', () =>
  require('../helpers/commentMock').commentSectionMock(),
)
jest.mock(
  'next/navigation',
  () => require('../helpers/galleryPagesMocks').navMock,
)
jest.mock(
  '@/hooks/useTenantId',
  () => require('../helpers/galleryPagesMocks').tenantMock,
)
jest.mock(
  '@/hooks/useCanManage',
  () => require('../helpers/galleryPagesMocks').manageMock,
)
jest.mock(
  '@/hooks/useSiteSession',
  () => require('../helpers/galleryPagesMocks').sessionMock,
)
jest.mock(
  '@/hooks/useGalleryAlbums',
  () => require('../helpers/galleryPagesMocks').albumsMock,
)
jest.mock(
  '@/hooks/useGalleryAlbum',
  () => require('../helpers/galleryPagesMocks').albumMock,
)
jest.mock(
  '@/hooks/useGalleryPicture',
  () => require('../helpers/galleryPagesMocks').pictureMock,
)
jest.mock(
  '@/hooks/useTagCloudPage',
  () => require('../helpers/galleryPagesMocks').tagsMock,
)

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
})
