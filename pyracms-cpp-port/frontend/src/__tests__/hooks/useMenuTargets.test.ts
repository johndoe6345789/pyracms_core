import { renderHook, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import { useMenuTargets } from '@/hooks/admin/useMenuTargets'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const m = asMockApi<'get'>(api)

it('offers sections, pages, albums and tags', async () => {
  m.get.mockImplementation((url: string) => {
    if (url.startsWith('/api/articles'))
      return Promise.resolve({
        data: [{ name: 'Trainz', displayName: 'Trainz' }],
      })
    if (url.startsWith('/api/gallery'))
      return Promise.resolve({ data: [{ id: 5, displayName: 'Gallery' }] })
    return Promise.resolve({ data: [{ name: 'easy', count: 3 }] })
  })
  const { result } = renderHook(() => useMenuTargets(2))
  await waitFor(() => expect(result.current.length).toBeGreaterThan(9))
  const values = result.current.map((t) => t.value)
  expect(values).toEqual(
    expect.arrayContaining([
      '/',
      '/articles/Trainz',
      '/gallery/5',
      '/tags/easy',
    ]),
  )
})

it('keeps the sections when everything fails; waits for a tenant', async () => {
  m.get.mockReset().mockRejectedValue(new Error('x'))
  const { result } = renderHook(() => useMenuTargets(2))
  await waitFor(() => expect(m.get).toHaveBeenCalled())
  expect(result.current.map((t) => t.value)).toContain('/forum')
  m.get.mockClear()
  renderHook(() => useMenuTargets(null))
  expect(m.get).not.toHaveBeenCalled()
})
