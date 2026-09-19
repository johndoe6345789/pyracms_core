import { renderHook, waitFor } from '@testing-library/react'
import { useGalleryAlbum } from '@/hooks/useGalleryAlbum'
import { useGalleryAlbums } from '@/hooks/useGalleryAlbums'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(),
    delete: jest.fn() },
}))
const m = api as unknown as Record<string, jest.Mock>
beforeEach(() => Object.values(m).forEach((f) => f.mockReset()))

describe('useGalleryAlbums', () => {
  it('maps albums and skips without tenant', async () => {
    m.get!.mockResolvedValue({ data: [
      { id: 1, displayName: 'A', defaultPictureUrl: '/c', pictureCount: 2 },
      { id: 2, name: 'B' }] })
    const { result } = renderHook(() => useGalleryAlbums(5))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.albums[0]).toMatchObject({ name: 'A' })
    expect(result.current.albums[1]!.coverImage).toContain('album2')
    renderHook(() => useGalleryAlbums(null))
    expect(m.get).toHaveBeenCalledTimes(1)
  })

  it('survives errors', async () => {
    m.get!.mockRejectedValue(new Error('x'))
    const { result } = renderHook(() => useGalleryAlbums(5))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.albums).toEqual([])
  })
})

describe('useGalleryAlbum', () => {
  it('maps pictures', async () => {
    m.get!.mockResolvedValue({ data: { name: 'N', pictures: [
      { id: 1, url: '/u' }, { id: 2, title: 'T', thumbnailUrl: '/t' },
      { id: 3 }] } })
    const { result } = renderHook(() => useGalleryAlbum('9'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.albumName).toBe('N')
    expect(result.current.pictures.map((p) => p.title))
      .toEqual(['Photo 1', 'T', 'Photo 3'])
    expect(result.current.pictures[2]!.src).toContain('pic3')
  })

  it('handles failure and empty id', async () => {
    m.get!.mockRejectedValue(new Error('x'))
    const { result } = renderHook(() => useGalleryAlbum('9'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.pictures).toEqual([])
    renderHook(() => useGalleryAlbum(''))
    expect(m.get).toHaveBeenCalledTimes(1)
  })
})
