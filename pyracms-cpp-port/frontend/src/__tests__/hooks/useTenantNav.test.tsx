import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { useTenantNav } from '@/hooks/useTenantNav'
import { makeStore } from '@/store/store'
import { setCredentials } from '@/store/slices/authSlice'
import { makeUser } from '../helpers/renderWithStore'
import { UserRole } from '@/types'

jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'demo' }),
  usePathname: () => '/site/demo/games',
}))

let tenant: { displayName: string; ownerId: number } | null = null
jest.mock('@/hooks/useTenant', () => ({
  titleFromSlug: (s: string) => s.toUpperCase(),
  useTenant: () => ({ tenant }),
}))

function setup(user?: ReturnType<typeof makeUser>) {
  const { store } = makeStore()
  if (user) store.dispatch(setCredentials({ user, token: 't' }))
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  return renderHook(() => useTenantNav(), { wrapper })
}

describe('useTenantNav', () => {
  beforeEach(() => {
    tenant = null
  })

  it('falls back to the slug title and finds the active link', () => {
    const { result } = setup()
    expect(result.current.siteName).toBe('DEMO')
    expect(result.current.activeLink).toBe('games')
    expect(result.current.canAdmin).toBe(false)
  })

  it('toggles the drawer', () => {
    const { result } = setup()
    act(() => result.current.openDrawer())
    expect(result.current.drawerOpen).toBe(true)
    act(() => result.current.toggleDrawer())
    expect(result.current.drawerOpen).toBe(false)
    act(() => result.current.toggleDrawer())
    act(() => result.current.closeDrawer())
    expect(result.current.drawerOpen).toBe(false)
  })

  it('lets site admins and owners administer', () => {
    tenant = { displayName: 'Demo', ownerId: 9 }
    expect(
      setup(makeUser({ role: UserRole.SiteAdmin })).result.current.canAdmin,
    ).toBe(true)
    expect(setup(makeUser({ id: 9 })).result.current.canAdmin).toBe(true)
    expect(setup(makeUser({ id: 3 })).result.current.canAdmin).toBe(false)
  })

  it('treats another site session as a guest', () => {
    tenant = { displayName: 'Demo', ownerId: 9 }
    const u = makeUser({ id: 9, tenantSlug: 'other' })
    expect(setup(u).result.current.canAdmin).toBe(false)
  })
})
