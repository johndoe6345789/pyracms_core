import { renderHook, waitFor, act } from '@testing-library/react'
import { useGalleryPicture } from '@/hooks/useGalleryPicture'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(),
    delete: jest.fn() },
}))
const m = api as unknown as Record<string, jest.Mock>
beforeEach(() => Object.values(m).forEach((f) => f.mockReset()))

describe('useGalleryPicture', () => {
  const pic = { title: 'T', url: '/u', likes: 1, albumId: 4,
    albumName: 'Al', tags: ['x'], isVideo: true, description: 'D' }

  it('loads and votes', async () => {
    m.get!.mockResolvedValue({ data: pic })
    m.post!.mockResolvedValue({})
    const { result } = renderHook(() => useGalleryPicture('7'))
    await waitFor(() => expect(result.current.picture).not.toBeNull())
    expect(result.current.picture).toMatchObject(
      { albumId: '4', isVideo: true, dislikes: 0 })
    await act(async () => { await result.current.handleLike() })
    await act(async () => { await result.current.handleDislike() })
    expect(result.current.picture).toMatchObject(
      { likes: 2, dislikes: 1 })
  })

  it('fills defaults, ignores vote errors, cover and delete', async () => {
    m.get!.mockResolvedValue({ data: {} })
    m.post!.mockRejectedValue(new Error('x'))
    m.put!.mockResolvedValue({}); m.delete!.mockResolvedValue({})
    const { result } = renderHook(() => useGalleryPicture('7'))
    await waitFor(() => expect(result.current.picture).not.toBeNull())
    expect(result.current.picture!.src).toContain('fullview')
    await act(async () => { await result.current.handleLike() })
    expect(result.current.picture!.likes).toBe(0)
    await result.current.handleSetCover()
    await result.current.handleDelete()
    expect(m.put).toHaveBeenCalled()
    expect(m.delete).toHaveBeenCalled()
  })

  it('handles load failure and empty id', async () => {
    m.get!.mockRejectedValue(new Error('x'))
    const { result } = renderHook(() => useGalleryPicture('7'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.picture).toBeNull()
    renderHook(() => useGalleryPicture(''))
    expect(m.get).toHaveBeenCalledTimes(1)
  })
})
