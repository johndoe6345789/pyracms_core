import { renderHook, act } from '@testing-library/react'
import { useGalleryManage } from '@/hooks/useGalleryManage'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { put: jest.fn(), delete: jest.fn() },
}))
const m = api as unknown as Record<string, jest.Mock>
const done = jest.fn()
const setup = (kind: 'albums' | 'pictures' = 'albums') =>
  renderHook(() => useGalleryManage(kind, '5')).result

describe('useGalleryManage', () => {
  beforeEach(() => {
    Object.values(m).forEach((f) => f.mockReset())
    done.mockReset()
  })

  it('updates and deletes', async () => {
    m.put!.mockResolvedValue({})
    m.delete!.mockResolvedValue({})
    const r = setup('pictures')
    await act(async () => {
      await r.current.update('N', 'D', done)
    })
    expect(m.put).toHaveBeenCalledWith('/api/gallery/pictures/5', {
      displayName: 'N',
      description: 'D',
    })
    await act(async () => {
      await r.current.remove(done)
    })
    expect(m.delete).toHaveBeenCalledWith('/api/gallery/pictures/5')
    expect(done).toHaveBeenCalledTimes(2)
  })
  it('exposes the server error and skips the callback', async () => {
    m.put!.mockRejectedValue({ response: { data: { error: 'nope' } } })
    const r = setup()
    await act(async () => {
      await r.current.update('N', 'D', done)
    })
    expect(r.current.error).toBe('nope')
    expect(done).not.toHaveBeenCalled()
  })
})
