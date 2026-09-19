import { renderHook, act, waitFor } from '@testing-library/react'
import { useGlobalSearch } from '@/components/common/search/useGlobalSearch'
import api from '@/lib/api'
import { usePathname } from 'next/navigation'
import { useTenantId } from '@/hooks/useTenantId'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
jest.mock('next/navigation', () => ({ usePathname: jest.fn() }))
jest.mock('@/hooks/useTenantId', () => ({ useTenantId: jest.fn() }))
const get = api.get as jest.Mock
const path = usePathname as jest.Mock
const tenant = useTenantId as jest.Mock
beforeEach(() => {
  get.mockReset()
  path.mockReturnValue('/site/demo/x')
  tenant.mockReturnValue({ tenantId: 7 })
})

describe('useGlobalSearch', () => {
  it('searches the site named in the path, not a fixed tenant', async () => {
    get.mockResolvedValue({ data: [{ id: 3, type: 'user' }] })
    const { result } = renderHook(() => useGlobalSearch())
    act(() => result.current.setQ('zz'))
    await waitFor(() => expect(result.current.res).toHaveLength(1))
    expect(tenant).toHaveBeenCalledWith('demo')
    expect(get.mock.calls[0][0]).toContain('&tenant_id=7')
  })

  it('does not query outside a site or before the tenant resolves', () => {
    path.mockReturnValue('/')
    tenant.mockReturnValue({ tenantId: null })
    const { result } = renderHook(() => useGlobalSearch())
    act(() => result.current.setQ('zz'))
    expect(tenant).toHaveBeenCalledWith('')
    expect(get).not.toHaveBeenCalled()
  })

  it('clears results on error and when closed', async () => {
    get.mockRejectedValue(new Error('x'))
    const { result } = renderHook(() => useGlobalSearch())
    act(() => {
      result.current.setOpen(true)
      result.current.setQ('qq')
    })
    await waitFor(() => expect(get).toHaveBeenCalled())
    expect(result.current.res).toEqual([])
    act(() => result.current.setOpen(false))
    expect(result.current.q).toBe('')
  })
})
