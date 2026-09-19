import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PicturePage } from '../helpers/pages/PicturePage'
import { h, pic } from '../helpers/galleryPagesMocks'

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
