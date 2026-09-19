import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PicturePage } from '../helpers/pages/PicturePage'
import { h, pic } from '../helpers/galleryPagesMocks'

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

describe('gallery picture page', () => {
  it('sets the cover from the picture page', async () => {
    h.handleSetCover.mockResolvedValue({})
    render(<PicturePage />)
    fireEvent.click(screen.getByTestId('set-cover-btn'))
    await waitFor(() => expect(h.handleSetCover).toHaveBeenCalled())
  })

  it('shows picture action failures', async () => {
    h.handleSetCover.mockRejectedValue({
      response: { data: { error: 'no cover' } },
    })
    render(<PicturePage />)
    fireEvent.click(screen.getByTestId('set-cover-btn'))
    expect(await screen.findByRole('alert')).toHaveTextContent('no cover')
  })

  it('renders nothing before the picture loads', () => {
    h.picture = null
    const { container } = render(<PicturePage />)
    expect(container).toBeEmptyDOMElement()
    h.picture = pic
  })
})
