import { renderHook, act, waitFor } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
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
  it('opens with Ctrl+K and closes with Escape', () => {
    const { result } = renderHook(() => useGlobalSearch())
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(result.current.open).toBe(true)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(result.current.open).toBe(false)
  })

  it('debounces, maps results and fills defaults', async () => {
    jest.useFakeTimers()
    get.mockResolvedValue({ data: { items: [{ id: 1, title: 'A' }, {}] } })
    const { result } = renderHook(() => useGlobalSearch())
    act(() => result.current.setQ('a'))
    act(() => {
      jest.advanceTimersByTime(400)
    })
    expect(get).not.toHaveBeenCalled()
    act(() => result.current.setQ('ab'))
    act(() => {
      jest.advanceTimersByTime(400)
    })
    jest.useRealTimers()
    await waitFor(() => expect(result.current.res).toHaveLength(2))
    expect(result.current.res[1]).toMatchObject({
      type: 'article',
      url: '#',
      title: '',
    })
    expect(get.mock.calls[0][0]).toBe(
      '/api/search/autocomplete?q=ab&tenant_id=7',
    )
  })
})
