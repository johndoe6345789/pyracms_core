import { renderHook, act, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useSuperAdminUsers } from '@/hooks/useSuperAdminUsers'
import api from '@/lib/api'
import { asMockApi } from '../helpers/mockApi'
import { RAW_USERS } from
  '../helpers/superAdminUsersFixtures'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
  },
}))

const mockApi = asMockApi<'get' | 'put'>(api)

beforeEach(() => {
  jest.clearAllMocks()
})

describe('useSuperAdminUsers — toggleBan', () => {
  it('does not call PUT for an unknown id', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_USERS })
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => { result.current.toggleBan(9999) })

    expect(mockApi.put).not.toHaveBeenCalled()
  })

  it('rolls the update back when PUT fails', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_USERS })
    mockApi.put.mockRejectedValueOnce(new Error('Server error'))
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { result.current.toggleBan(1) })

    // Give microtasks time to settle
    await act(async () => {})

    // A refused ban must not look applied
    expect(result.current.users[0]!.isActive).toBe(true)
  })

  it('does not affect other users when toggling one', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_USERS })
    mockApi.put.mockResolvedValueOnce({ data: {} })
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { result.current.toggleBan(1) })

    await waitFor(() => {
      expect(result.current.users[0]!.isActive).toBe(false)
    })

    // bob's isActive must not have changed
    expect(result.current.users[1]!.isActive).toBe(false)
  })
})
