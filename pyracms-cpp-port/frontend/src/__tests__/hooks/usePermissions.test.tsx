import React from 'react'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { usePermissions } from '@/hooks/usePermissions'
import { makeStore } from '@/store/store'
import { setCredentials } from '@/store/slices/authSlice'
import { makeUser } from '../helpers/renderWithStore'
import { UserRole } from '@/types'

let ownerId = 99
jest.mock('@/hooks/useTenant', () => ({
  useTenant: () => ({ tenant: { ownerId } }),
}))

function setup(over?: Parameters<typeof makeUser>[0]) {
  const { store } = makeStore()
  if (over) {
    const user = makeUser(over)
    store.dispatch(setCredentials({ user, token: 't' }))
  }
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  return renderHook(() => usePermissions('demo'), { wrapper }).result.current
}

describe('usePermissions', () => {
  beforeEach(() => {
    ownerId = 99
  })

  it('treats a signed-out visitor as a Guest', () => {
    const p = setup()
    expect(p.signedIn).toBe(false)
    expect(p.role).toBe(UserRole.Guest)
    expect(p.can('comment')).toBe(false)
  })

  it('lets a member comment but not write articles', () => {
    const p = setup({ role: UserRole.User, tenantSlug: 'demo' })
    expect(p.can('comment')).toBe(true)
    expect(p.can('writeArticles')).toBe(false)
  })

  it('treats a session for another site as a Guest', () => {
    const p = setup({ role: UserRole.SiteAdmin, tenantSlug: 'other' })
    expect(p.signedIn).toBe(false)
    expect(p.can('manageSite')).toBe(false)
  })

  it('makes the site owner an Administrator', () => {
    ownerId = 1
    const p = setup({ id: 1, role: UserRole.User })
    expect(p.isOwner).toBe(true)
    expect(p.role).toBe(UserRole.SiteAdmin)
    expect(p.can('manageSite')).toBe(true)
  })

  it('lets a Moderator moderate and write articles', () => {
    const p = setup({ role: UserRole.Moderator, tenantSlug: 'demo' })
    expect(p.can('moderate')).toBe(true)
    expect(p.can('writeArticles')).toBe(true)
    expect(p.can('manageSite')).toBe(false)
  })
})
