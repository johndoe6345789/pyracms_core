import { renderHook, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import { useFeaturedPhoto } from '@/hooks/useFeaturedPhoto'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const m = asMockApi<'get'>(api)

it('loads a random photo of the site', async () => {
  m.get.mockResolvedValue({
    data: { id: 4, displayName: 'Dawn', albumName: 'Trip', fileUuid: 'u1' },
  })
  const { result } = renderHook(() => useFeaturedPhoto(2))
  await waitFor(() => expect(result.current?.id).toBe('4'))
  expect(m.get).toHaveBeenCalledWith('/api/gallery/random?tenant_id=2')
  expect(result.current?.src).toMatch(/\/api\/files\/u1$/)
  expect(result.current?.albumName).toBe('Trip')
})

it('is null when there is nothing to show or no tenant', async () => {
  m.get.mockReset().mockRejectedValue(new Error('404'))
  const { result } = renderHook(() => useFeaturedPhoto(2))
  await waitFor(() => expect(m.get).toHaveBeenCalled())
  expect(result.current).toBeNull()
  m.get.mockClear()
  renderHook(() => useFeaturedPhoto(null))
  expect(m.get).not.toHaveBeenCalled()
})
