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
  it('bans an active user: sets isActive=false', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_USERS })
    mockApi.put.mockResolvedValueOnce({ data: {} })
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.users[0]!.isActive).toBe(true)

    await act(async () => { result.current.toggleBan(1) })

    await waitFor(() => {
      expect(result.current.users[0]!.isActive).toBe(false)
    })

    expect(mockApi.put).toHaveBeenCalledWith(
      '/api/users/1/ban',
      { banned: true },
    )
  })

  it('unbans an inactive user: sets isActive=true', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_USERS })
    mockApi.put.mockResolvedValueOnce({ data: {} })
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))
    // user id=2 starts with isActive=false
    expect(result.current.users[1]!.isActive).toBe(false)

    await act(async () => { result.current.toggleBan(2) })

    await waitFor(() => {
      expect(result.current.users[1]!.isActive).toBe(true)
    })

    expect(mockApi.put).toHaveBeenCalledWith(
      '/api/users/2/ban',
      { banned: false },
    )
  })
})
