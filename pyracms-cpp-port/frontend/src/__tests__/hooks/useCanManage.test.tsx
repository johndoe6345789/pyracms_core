import { renderHook } from '@testing-library/react'
import { useCanManage } from '@/hooks/useCanManage'

let state: Record<string, unknown> = {}
jest.mock('react-redux', () => ({
  useSelector: (f: (s: unknown) => unknown) => f({ auth: state }),
}))

const auth = (user: unknown, isAuthenticated = true) => {
  state = { user, isAuthenticated }
}
const can = (owner: number | null) =>
  renderHook(() => useCanManage('s', owner)).result.current

describe('useCanManage', () => {
  it('lets the owner and admins manage', () => {
    auth({ id: 4, isAdmin: false })
    expect(can(4)).toBe(true)
    expect(can(5)).toBe(false)
    auth({ id: 9, isAdmin: true })
    expect(can(5)).toBe(true)
    auth({ id: 9, isAdmin: false, role: 3 })
    expect(can(5)).toBe(true)
  })
  it('denies guests and other sites', () => {
    auth(null, false)
    expect(can(4)).toBe(false)
    auth({ id: 4, isAdmin: true, tenantSlug: 'other' })
    expect(can(4)).toBe(false)
  })
})
