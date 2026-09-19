import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { useAuthParams, safeRedirect } from '@/hooks/useAuthParams'
import { useAuthHydration } from '@/hooks/useAuthHydration'
import { makeStore } from '@/store/store'
import { setToken } from '@/lib/session'
import api from '@/lib/api'

let search = new URLSearchParams()
let path = '/'
jest.mock('next/navigation', () => ({
  useSearchParams: () => search,
  usePathname: () => path,
}))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const get = api.get as jest.Mock

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

describe('useAuthHydration', () => {
  beforeEach(() => {
    localStorage.clear()
    get.mockReset()
    path = '/'
  })

  const run = () => {
    const { store } = makeStore()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    )
    renderHook(() => useAuthHydration(), { wrapper })
    return store
  }

  it('logs out when there is no token', () => {
    expect(run().getState().auth.isAuthenticated).toBe(false)
    expect(get).not.toHaveBeenCalled()
  })

  it('restores the session from the api', async () => {
    setToken('demo', 'tok')
    path = '/site/demo/forum'
    get.mockResolvedValue({ data: { id: 1, username: 'a' } })
    const store = run()
    await waitFor(() =>
      expect(store.getState().auth.isAuthenticated).toBe(true),
    )
  })

  it('clears an invalid token', async () => {
    setToken(null, 'bad')
    get.mockRejectedValue(new Error('401'))
    run()
    await waitFor(() => expect(localStorage.getItem('token')).toBeNull())
  })
})
