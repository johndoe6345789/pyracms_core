import { renderHook, act, waitFor } from '@testing-library/react'
import { useMenuEditor } from '@/hooks/useMenuEditor'
import { newDraft } from '@/lib/menuDraft'
import { m } from '../../helpers/scopeApi'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

const setup = async () => {
  const h = renderHook(() => useMenuEditor(1))
  await waitFor(() => expect(h.result.current.loading).toBe(false))
  return h
}

beforeEach(() => {
  jest.resetAllMocks()
  m.get.mockImplementation((url: string) =>
    url.includes('items')
      ? Promise.resolve({
          data: [{ id: 10, name: 'H', routePath: '/', url: '' }],
        })
      : Promise.resolve({
          data: [
            { id: 1, name: 'main' },
            { id: 2, name: 'foot' },
          ],
        }),
  )
  m.post.mockResolvedValue({ data: { id: 50 } })
  m.put.mockResolvedValue({})
  m.delete.mockResolvedValue({})
})

it('tolerates api failures', async () => {
  m.post.mockRejectedValue(new Error('x'))
  m.put.mockRejectedValue(new Error('x'))
  m.delete.mockRejectedValue(new Error('x'))
  const { result } = await setup()
  await act(async () => {
    await result.current.save({ ...newDraft(), name: 'N', route: '/n' })
  })
  await act(async () => {
    await result.current.save(
      { ...newDraft(), name: 'H', route: '/' },
      result.current.currentItems[0]!.id,
    )
  })
  await act(() => result.current.move(10, 1))
  await act(() => result.current.remove(10))
  expect(result.current.error).not.toBe('')
  m.get.mockImplementation((url: string) =>
    url.includes('items')
      ? Promise.reject(new Error('x'))
      : Promise.resolve({ data: null }),
  )
  await setup()
  m.get.mockRejectedValue(new Error('x'))
  await setup()
})

it('creates the menu on the first add when the site has none', async () => {
  m.get.mockImplementation((url: string) =>
    Promise.resolve({ data: url.includes('items') ? [] : [] }),
  )
  m.post.mockResolvedValueOnce({ data: { id: 8 } }).mockResolvedValue({
    data: { id: 60 },
  })
  const { result } = await setup()
  await act(async () => {
    await result.current.save({ ...newDraft(), name: 'N', route: '/n' })
  })
  expect(m.post).toHaveBeenNthCalledWith(1, '/api/menu-groups', {
    name: 'main',
    tenantId: 1,
  })
  await waitFor(() => expect(result.current.currentItems).toHaveLength(1))
})
