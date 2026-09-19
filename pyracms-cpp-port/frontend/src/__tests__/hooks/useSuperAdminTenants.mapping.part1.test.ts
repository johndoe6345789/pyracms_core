import { renderHook, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useSuperAdminTenants } from '@/hooks/useSuperAdminTenants'
import api from '@/lib/api'
import { asMockApi } from '../helpers/mockApi'
import {
  RAW_TENANTS,
  MAPPED_TENANTS,
} from '../helpers/superAdminTenantsFixtures'

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

describe('useSuperAdminTenants — mapping', () => {
  it('maps all tenant row fields', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_TENANTS })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.tenants).toEqual(MAPPED_TENANTS)
  })

  it('uses slug as name when displayName is absent', async () => {
    const raw = [{ id: 3, slug: 'delta', isActive: true }]
    mockApi.get.mockResolvedValueOnce({ data: raw })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.tenants[0]!.name).toBe('delta')
  })

  it('defaults isActive to true when field is missing', async () => {
    const raw = [{ id: 4, slug: 'echo' }]
    mockApi.get.mockResolvedValueOnce({ data: raw })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.tenants[0]!.isActive).toBe(true)
  })
})
