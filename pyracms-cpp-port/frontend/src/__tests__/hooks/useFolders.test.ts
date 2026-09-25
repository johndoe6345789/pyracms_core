import { renderHook, act, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import { useFolders } from '@/hooks/admin/useFolders'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))
const m = asMockApi<'get' | 'post' | 'put' | 'delete'>(api)

beforeEach(() => {
  m.get.mockReset().mockResolvedValue({ data: ['a/b'] })
  m.post.mockReset().mockResolvedValue({ data: {} })
  m.put.mockReset().mockResolvedValue({ data: {} })
  m.delete.mockReset().mockResolvedValue({ data: {} })
})

it('loads folders, adding the ones implied by a path', async () => {
  const { result } = renderHook(() => useFolders(4, jest.fn()))
  await waitFor(() => expect(result.current.folders).toEqual(['a', 'a/b']))
  expect(m.get).toHaveBeenCalledWith('/api/files/folders?tenant_id=4')
})

it('creates inside the open folder, removes and moves', async () => {
  const moved = jest.fn()
  const { result } = renderHook(() => useFolders(4, moved))
  await waitFor(() => expect(result.current.folders.length).toBe(2))
  act(() => result.current.setFolder('a'))
  act(() => result.current.create(' new '))
  await waitFor(() =>
    expect(m.post).toHaveBeenCalledWith('/api/files/folders?tenant_id=4', {
      path: 'a/new',
    }),
  )
  act(() => result.current.remove('a/b'))
  await waitFor(() =>
    expect(m.delete).toHaveBeenCalledWith(
      '/api/files/folders?tenant_id=4&path=a%2Fb',
    ),
  )
  act(() => result.current.move('u1', 'a'))
  await waitFor(() => expect(moved).toHaveBeenCalled())
  expect(m.put).toHaveBeenCalledWith('/api/files/u1/folder', { folder: 'a' })
})

it('reports failures and does nothing without a tenant', async () => {
  m.delete.mockRejectedValue({
    response: { data: { error: 'The folder is not empty' } },
  })
  const { result } = renderHook(() => useFolders(4, jest.fn()))
  act(() => result.current.remove('a'))
  await waitFor(() => expect(result.current.error).toMatch(/empty/))
  m.get.mockClear()
  renderHook(() => useFolders(null, jest.fn()))
  expect(m.get).not.toHaveBeenCalled()
})
