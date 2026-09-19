import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { useAdminGate, RESTORE_TIMEOUT_MS } from '@/hooks/useAdminGate'
import { isSessionOnSite } from '@/hooks/useSiteSession'
import { makeStore } from '@/store/store'
import { setCredentials } from '@/store/slices/authSlice'
import { makeUser } from '../../helpers/renderWithStore'

let nav = { slug: 's', canAdmin: false, loading: false }
let token: string | null = null
jest.mock('@/hooks/useTenantNav', () => ({ useTenantNav: () => nav }))
jest.mock('@/lib/session', () => ({ getToken: () => token }))

const setup = (signedIn = false) => {
  const { store } = makeStore()
  if (signedIn) {
    store.dispatch(setCredentials({ user: makeUser(), token: 't' }))
  }
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  return renderHook(() => useAdminGate(), { wrapper })
}

beforeEach(() => {
  nav = { slug: 's', canAdmin: false, loading: false }
  token = null
  jest.useFakeTimers()
})
afterEach(() => jest.useRealTimers())

it('denies guests immediately', () => {
  const { result } = setup()
  expect(result.current).toEqual({ slug: 's', allowed: false, checking: false })
})

it('waits while the site record loads', () => {
  nav = { ...nav, loading: true }
  expect(setup().result.current.checking).toBe(true)
})

it('waits for a stored session, then gives up', () => {
  token = 'stored'
  const { result } = setup()
  expect(result.current.checking).toBe(true)
  act(() => {
    jest.advanceTimersByTime(RESTORE_TIMEOUT_MS)
  })
  expect(result.current.checking).toBe(false)
  expect(result.current.allowed).toBe(false)
})

it('allows admins once the session is restored', () => {
  token = 'stored'
  nav = { ...nav, canAdmin: true }
  const { result } = setup(true)
  expect(result.current).toMatchObject({ allowed: true, checking: false })
})

it('scopes sessions to the site', () => {
  const user = makeUser({ tenantSlug: 'other' })
  expect(isSessionOnSite(true, user, 's')).toBe(false)
  expect(isSessionOnSite(true, user, 'other')).toBe(true)
  expect(isSessionOnSite(true, makeUser(), 's')).toBe(true)
  expect(isSessionOnSite(false, null, 's')).toBe(false)
})
