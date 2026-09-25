import { renderHook, act, waitFor } from '@testing-library/react'
import { useMenuEditor } from '@/hooks/useMenuEditor'
import { newDraft } from '@/lib/menuDraft'
import { m } from '../../helpers/scopeApi'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

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

const setup = async () => {
  const h = renderHook(() => useMenuEditor(1))
  await waitFor(() => expect(h.result.current.loading).toBe(false))
  return h
}

it('loads groups and switches', async () => {
  const { result } = await setup()
  expect(result.current.selectedGroup).toBe('main')
  expect(result.current.currentItems[0]).toMatchObject({
    position: 0,
    permissions: 'public',
    type: 'route',
    parentId: 0,
  })
  act(() =>
    result.current.handleGroupChange({ target: { value: 'foot' } } as never),
  )
  expect(result.current.selectedGroup).toBe('foot')
})

it('edits and deletes items', async () => {
  const { result } = await setup()
  await act(async () => {
    await result.current.save(
      { ...newDraft(), name: 'Z', route: '/' },
      result.current.currentItems[0]!.id,
    )
  })
  await waitFor(() => expect(result.current.currentItems[0]!.name).toBe('Z'))
  await act(() => result.current.remove(10))
  await waitFor(() => expect(result.current.currentItems).toHaveLength(0))
})

it('adds items at the end', async () => {
  const { result } = await setup()
  await act(async () => {
    await result.current.save({
      ...newDraft(),
      name: 'N',
      route: '/n',
      permissions: 'admin',
    })
  })
  await waitFor(() => expect(result.current.currentItems).toHaveLength(2))
  expect(result.current.currentItems[1]).toMatchObject({
    id: 50,
    position: 1,
    permissions: 'admin',
  })
})
