import { renderHook } from '@testing-library/react'
import { useAuthParams, safeRedirect } from '@/hooks/useAuthParams'

let search = new URLSearchParams()

const path = '/'

jest.mock('next/navigation', () => ({
  useSearchParams: () => search,
  usePathname: () => path,
}))

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))

describe('safeRedirect', () => {
  it('only allows same-origin paths', () => {
    expect(safeRedirect(null)).toBeUndefined()
    expect(safeRedirect('http://evil')).toBeUndefined()
    expect(safeRedirect('//evil')).toBeUndefined()
    expect(safeRedirect('/ok')).toBe('/ok')
  })
})

describe('useAuthParams', () => {
  it('derives tenant and redirect', () => {
    search = new URLSearchParams('tenant=demo')
    expect(renderHook(() => useAuthParams()).result.current).toEqual({
      tenant: 'demo',
      redirectTo: '/site/demo',
    })
    search = new URLSearchParams('tenant=demo&redirect=/x')
    expect(renderHook(() => useAuthParams()).result.current.redirectTo).toBe(
      '/x',
    )
    search = new URLSearchParams('')
    expect(renderHook(() => useAuthParams('/f')).result.current).toEqual({
      tenant: undefined,
      redirectTo: '/f',
    })
  })
})
