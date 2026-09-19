import { renderHook, act, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useSuperAdminTenants } from '@/hooks/useSuperAdminTenants'
import api from '@/lib/api'
import { asMockApi } from '../helpers/mockApi'
import { RAW_TENANTS } from
  '../helpers/superAdminTenantsFixtures'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    delete: jest.fn(),
    post: jest.fn(),
  },
}))

const mockApi = asMockApi<'get' | 'delete' | 'post'>(api)

beforeEach(() => {
  jest.clearAllMocks()
})

describe('useSuperAdminTenants — handleDelete', () => {
  it('sets confirmDeleteId to the given id', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_TENANTS })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => { result.current.handleDelete(1) })

    expect(result.current.confirmDeleteId).toBe(1)
  })
})

describe('useSuperAdminTenants — cancelDelete', () => {
  it('resets confirmDeleteId to null', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_TENANTS })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => { result.current.handleDelete(1) })
    expect(result.current.confirmDeleteId).toBe(1)

    act(() => { result.current.cancelDelete() })
    expect(result.current.confirmDeleteId).toBeNull()
  })
})
