import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
  renderHook,
  act,
} from '@testing-library/react'
import GalleryPage from '@/app/site/[slug]/(tenant)/gallery/page'
import { useCreateAlbum } from '@/hooks/useCreateAlbum'
import { m } from '../helpers/scopeApi'
import { routeGet } from '../helpers/scopeMocks'

let signedIn = true
jest.mock('@/lib/api', () => jest.requireActual('../helpers/apiMock').apiMock)
jest.mock(
  'next/navigation',
  () => jest.requireActual('../helpers/scopeMocks').navMock,
)
jest.mock(
  '@/hooks/useTenantId',
  () => jest.requireActual('../helpers/scopeMocks').tenantMock,
)
jest.mock('@/hooks/useSiteSession', () => ({
  useSiteSession: () => signedIn,
}))

const box = (id: string) => within(screen.getByTestId(id)).getByRole('textbox')

beforeEach(() => {
  jest.resetAllMocks()
  signedIn = true
  routeGet({ '/api/gallery/albums': [{ id: 1, name: 'A' }] })
  m.post.mockResolvedValue({ data: {} })
})

it('hides the button from guests', async () => {
  signedIn = false
  render(<GalleryPage />)
  await screen.findByTestId('album-card-1')
  expect(screen.queryByTestId('create-album-btn')).toBeNull()
})

it('creates an album and refreshes the list', async () => {
  render(<GalleryPage />)
  fireEvent.click(await screen.findByTestId('create-album-btn'))
  fireEvent.change(box('album-name-input'), { target: { value: ' Trip ' } })
  fireEvent.change(box('album-description-input'), { target: { value: 'Fun' } })
  fireEvent.click(screen.getByTestId('submit-album-btn'))
  await waitFor(() =>
    expect(m.post).toHaveBeenCalledWith('/api/gallery/albums', {
      displayName: 'Trip',
      description: 'Fun',
      tenantId: 1,
    }),
  )
  await waitFor(() => expect(m.get).toHaveBeenCalledTimes(2))
})

it('reports failures and can be cancelled', async () => {
  m.post.mockRejectedValue(new Error('x'))
  render(<GalleryPage />)
  fireEvent.click(await screen.findByTestId('create-album-btn'))
  expect(screen.getByTestId('submit-album-btn')).toBeDisabled()
  fireEvent.change(box('album-name-input'), { target: { value: 'T' } })
  fireEvent.click(screen.getByTestId('submit-album-btn'))
  await screen.findByText('Failed to create album')
  fireEvent.click(screen.getByTestId('cancel-album-btn'))
})

it('useCreateAlbum ignores empty names and missing tenants', () => {
  const { result } = renderHook(() => useCreateAlbum(null, jest.fn()))
  act(() => result.current.submit())
  act(() => result.current.setName('x'))
  act(() => result.current.submit())
  expect(m.post).not.toHaveBeenCalled()
})
