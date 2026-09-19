import { render, screen } from '@testing-library/react'
import GalleryPage from '@/app/site/[slug]/(tenant)/gallery/page'
import AlbumPage from '@/app/site/[slug]/(tenant)/gallery/[albumId]/page'

jest.mock('@/components/common/CommentSection', () =>
  jest.requireActual('../helpers/commentMock').commentSectionMock(),
)
jest.mock(
  'next/navigation',
  () => jest.requireActual('../helpers/galleryPagesMocks').navMock,
)
jest.mock(
  '@/hooks/useTenantId',
  () => jest.requireActual('../helpers/galleryPagesMocks').tenantMock,
)
jest.mock(
  '@/hooks/useCanManage',
  () => jest.requireActual('../helpers/galleryPagesMocks').manageMock,
)
jest.mock(
  '@/hooks/useSiteSession',
  () => jest.requireActual('../helpers/galleryPagesMocks').sessionMock,
)
jest.mock(
  '@/hooks/useGalleryAlbums',
  () => jest.requireActual('../helpers/galleryPagesMocks').albumsMock,
)
jest.mock(
  '@/hooks/useGalleryAlbum',
  () => jest.requireActual('../helpers/galleryPagesMocks').albumMock,
)
jest.mock(
  '@/hooks/useGalleryPicture',
  () => jest.requireActual('../helpers/galleryPagesMocks').pictureMock,
)
jest.mock(
  '@/hooks/useTagCloudPage',
  () => jest.requireActual('../helpers/galleryPagesMocks').tagsMock,
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
