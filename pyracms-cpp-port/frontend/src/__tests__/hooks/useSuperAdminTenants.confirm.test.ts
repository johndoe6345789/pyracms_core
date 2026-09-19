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

describe('useSuperAdminTenants — confirmDelete (success)', () => {
  it('calls DELETE /api/tenants/{id} and removes item', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_TENANTS })
    mockApi.delete.mockResolvedValueOnce({ data: {} })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.tenants).toHaveLength(2)

    act(() => { result.current.handleDelete(1) })

    await act(async () => { result.current.confirmDelete() })

    await waitFor(() => {
      expect(result.current.confirmDeleteId).toBeNull()
    })

    expect(mockApi.delete).toHaveBeenCalledWith('/api/tenants/1')
    expect(result.current.tenants).toHaveLength(1)
    expect(result.current.tenants[0]!.id).toBe(2)
  })
})

describe('useSuperAdminTenants — confirmDelete (no-op)', () => {
  it('does nothing when confirmDeleteId is null', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_TENANTS })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.confirmDeleteId).toBeNull()

    act(() => { result.current.confirmDelete() })

    expect(mockApi.delete).not.toHaveBeenCalled()
    expect(result.current.tenants).toHaveLength(2)
  })
})
