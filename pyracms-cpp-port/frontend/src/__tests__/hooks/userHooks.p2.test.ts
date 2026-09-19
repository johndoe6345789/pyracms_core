import { renderHook, waitFor } from '@testing-library/react'
import { useUserActivity } from '@/components/users/useUserActivity'
import { TYPE_COLORS, getTypeIcon } from '@/components/users/ActivityItem'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const get = api.get as jest.Mock
beforeEach(() => get.mockReset())

describe('useUserActivity', () => {
  it('maps activity rows', async () => {
    get.mockResolvedValue({
      data: [
        { id: 1, type: 'article', title: 'T', summary: 'S', createdAt: 'when' },
        { id: 2, type: 'vote' },
      ],
    })
    const { result } = renderHook(() => useUserActivity(5, false))
    await waitFor(() => expect(result.current).toHaveLength(2))
    expect(result.current[0]).toEqual({
      id: '1',
      type: 'article',
      title: 'T',
      description: 'S',
      date: 'when',
    })
    expect(result.current[1]!.description).toBe('')
  })

  it('skips fetching when told to or without a user', () => {
    renderHook(() => useUserActivity(5, true))
    renderHook(() => useUserActivity(undefined, false))
    expect(get).not.toHaveBeenCalled()
  })

  it('treats null data and errors as empty', async () => {
    get.mockResolvedValueOnce({ data: null })
    const a = renderHook(() => useUserActivity(1, false))
    await waitFor(() => expect(get).toHaveBeenCalled())
    expect(a.result.current).toEqual([])
    get.mockRejectedValueOnce(new Error('x'))
    const b = renderHook(() => useUserActivity(2, false))
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2))
    expect(b.result.current).toEqual([])
  })

  it('re-exports the icon helpers', () => {
    expect(TYPE_COLORS.article).toBeDefined()
    expect(getTypeIcon('vote')).toBeDefined()
  })
})
