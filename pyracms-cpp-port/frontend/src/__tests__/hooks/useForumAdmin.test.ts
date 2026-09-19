import { renderHook, act } from '@testing-library/react'
import api from '@/lib/api'
import { useForumAdmin } from '@/hooks/useForumAdmin'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))
const m = asMockApi<'post'>(api)
beforeEach(() => m.post.mockReset())

const dlg = { kind: 'category', mode: 'create' } as const

describe('useForumAdmin', () => {
  it('submits, closes and refreshes', async () => {
    m.post.mockResolvedValue({})
    const done = jest.fn()
    const { result } = renderHook(() => useForumAdmin(1, done))
    act(() => result.current.open(dlg))
    await act(() => result.current.submit(' A '))
    expect(m.post).toHaveBeenCalledWith(
      '/api/forum/categories', { name: 'A', tenantId: 1 })
    expect(done).toHaveBeenCalled()
    expect(result.current.dialog).toBeNull()
  })
  it('keeps the dialog open and shows API errors', async () => {
    m.post.mockRejectedValue({ response: { data: { error: 'Forbidden' } } })
    const done = jest.fn()
    const { result } = renderHook(() => useForumAdmin(1, done))
    act(() => result.current.open(dlg))
    await act(() => result.current.submit('A'))
    expect(result.current.error).toBe('Forbidden')
    expect(result.current.dialog).not.toBeNull()
    expect(done).not.toHaveBeenCalled()
    act(() => result.current.close())
    expect(result.current.dialog).toBeNull()
  })
  it('does nothing without a dialog or tenant', async () => {
    const { result } = renderHook(() => useForumAdmin(null, jest.fn()))
    await act(() => result.current.submit('A'))
    expect(m.post).not.toHaveBeenCalled()
  })
})
