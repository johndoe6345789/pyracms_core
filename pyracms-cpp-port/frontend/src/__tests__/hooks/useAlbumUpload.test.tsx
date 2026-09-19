import {
  renderHook,
  act,
  render,
  screen,
  fireEvent,
} from '@testing-library/react'
import api from '@/lib/api'
import { useAlbumUpload } from '@/hooks/useAlbumUpload'
import AlbumHeader from '@/components/gallery/AlbumHeader'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))
const m = asMockApi<'post'>(api)
beforeEach(() => m.post.mockReset())

const files = (...names: string[]) =>
  names.map(
    (n) => new File(['x'], n, { type: 'image/png' }),
  ) as unknown as FileList

describe('useAlbumUpload', () => {
  it('uploads each file then attaches it to the album', async () => {
    m.post
      .mockResolvedValueOnce({ data: { uuid: 'u1' } })
      .mockResolvedValueOnce({ data: {} })
    const done = jest.fn()
    const { result } = renderHook(() => useAlbumUpload('4', 9, done))
    await act(() => result.current.upload(files('cat.png')))
    expect(m.post).toHaveBeenNthCalledWith(
      1,
      '/api/files',
      expect.any(FormData),
      expect.anything(),
    )
    expect(m.post).toHaveBeenNthCalledWith(
      2,
      '/api/gallery/albums/4/pictures',
      { displayName: 'cat', fileUuid: 'u1' },
    )
    expect(done).toHaveBeenCalled()
    expect(result.current.error).toBe('')
  })
  it('reports the failure and still refreshes', async () => {
    m.post.mockRejectedValue({ response: { data: { error: 'Forbidden' } } })
    const done = jest.fn()
    const { result } = renderHook(() => useAlbumUpload('4', 9, done))
    await act(() => result.current.upload(files('a.png')))
    expect(result.current.error).toBe('Forbidden')
    expect(done).toHaveBeenCalled()
  })
  it('does nothing without a tenant', async () => {
    const { result } = renderHook(() => useAlbumUpload('4', null, jest.fn()))
    await act(() => result.current.upload(files('a.png')))
    expect(m.post).not.toHaveBeenCalled()
  })
})

describe('AlbumHeader upload', () => {
  it('passes chosen files on and can hide the button', () => {
    const onFiles = jest.fn()
    const { rerender } = render(
      <AlbumHeader albumName="A" count={0} onFiles={onFiles} />,
    )
    const f = files('a.png')
    fireEvent.change(screen.getByTestId('upload-file-input'), {
      target: { files: f },
    })
    expect(onFiles).toHaveBeenCalledWith(f)
    rerender(<AlbumHeader albumName="A" count={0} canUpload={false} />)
    expect(screen.queryByTestId('upload-picture-btn')).toBeNull()
  })
})
