import { renderHook, act } from '@testing-library/react'
import { useAlbumEdit } from '@/hooks/useAlbumEdit'
import { m } from '../helpers/scopeApi'

jest.mock('@/lib/api', () => jest.requireActual('../helpers/apiMock').apiMock)
const d = {
  name: ' Trip ',
  description: 'x',
  isPrivate: true,
  sortOrder: 'title',
}

beforeEach(() => {
  jest.resetAllMocks()
  m.put.mockResolvedValue({})
  m.delete.mockResolvedValue({})
})

it('saves details, cover mode and photo actions, then reloads', async () => {
  const done = jest.fn()
  const { result } = renderHook(() => useAlbumEdit('3', done))
  await act(() => result.current.saveDetails(d))
  expect(m.put).toHaveBeenLastCalledWith('/api/gallery/albums/3', {
    displayName: 'Trip',
    description: 'x',
    isPrivate: true,
    sortOrder: 'title',
  })
  await act(() => result.current.setCoverMode(d, 'random'))
  expect(m.put).toHaveBeenLastCalledWith(
    '/api/gallery/albums/3',
    expect.objectContaining({ coverMode: 'random' }),
  )
  await act(() => result.current.setCover('9'))
  expect(m.put).toHaveBeenLastCalledWith('/api/gallery/pictures/9/default', {})
  await act(() => result.current.editPicture('9', 'T', 'D'))
  expect(m.put).toHaveBeenLastCalledWith('/api/gallery/pictures/9', {
    displayName: 'T',
    description: 'D',
  })
  await act(() => result.current.removePicture('9'))
  expect(m.delete).toHaveBeenCalledWith('/api/gallery/pictures/9')
  expect(done).toHaveBeenCalledTimes(5)
  expect(result.current.saved).toBe(true)
})

it('reports a failure and does not reload', async () => {
  m.delete.mockRejectedValue({ response: { data: { error: 'Nope' } } })
  const done = jest.fn()
  const { result } = renderHook(() => useAlbumEdit('3', done))
  await act(() => result.current.removePicture('9'))
  expect(result.current.error).toBe('Nope')
  expect(result.current.saved).toBe(false)
  expect(done).not.toHaveBeenCalled()
})
