import { screen, fireEvent } from '@testing-library/react'
import UserBubble from '@/components/common/UserBubble'
import { renderWithStore, makeUser } from '../../helpers/renderWithStore'
import { setToken } from '@/lib/session'
import { UserRole } from '@/types'

const push = jest.fn()
let params: Record<string, string> = {}
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useParams: () => params,
  usePathname: () => '/site/demo/forum',
}))

describe('UserBubble', () => {
  beforeEach(() => { push.mockClear(); params = {}; localStorage.clear() })

  it('shows a plain sign-in chip on the portal', () => {
    renderWithStore(<UserBubble />)
    const chip = screen.getByTestId('guest-login-link')
    expect(chip).toHaveAttribute('href', '/auth/login')
    expect(chip).toHaveTextContent('Sign in')
  })

  it('links a site guest back to that site', () => {
    params = { slug: 'demo' }
    renderWithStore(<UserBubble />)
    const href = screen.getByTestId('guest-login-link')
      .getAttribute('href')
    expect(href).toContain('tenant=demo')
    expect(href).toContain('redirect=%2Fsite%2Fdemo%2Fforum')
  })

  it('treats a session for another site as a guest', () => {
    params = { slug: 'demo' }
    renderWithStore(<UserBubble />, makeUser({ tenantSlug: 'other' }))
    expect(screen.getByTestId('guest-login-link'))
      .toHaveTextContent('Sign in here')
  })

  it('shows portal links and super admin', () => {
    renderWithStore(<UserBubble />, makeUser({ role: UserRole.SuperAdmin }))
    fireEvent.click(screen.getByTestId('user-bubble-btn'))
    expect(screen.getByTestId('create-site-link')).toBeInTheDocument()
    expect(screen.getByTestId('super-admin-link')).toBeInTheDocument()
    expect(screen.getByText('Platform account')).toBeInTheDocument()
  })

  it('hides super admin for ordinary users', () => {
    renderWithStore(<UserBubble />, makeUser())
    fireEvent.click(screen.getByTestId('user-bubble-btn'))
    expect(screen.queryByTestId('super-admin-link')).toBeNull()
  })

  it('shows site links and signs out of that site', () => {
    params = { slug: 'demo' }
    setToken('demo', 'tok')
    const { store } = renderWithStore(<UserBubble />,
      makeUser({ tenantSlug: 'demo' }))
    fireEvent.click(screen.getByTestId('user-bubble-btn'))
    expect(screen.getByTestId('admin-link')).toBeInTheDocument()
    expect(screen.getByTestId('settings-link')).toBeInTheDocument()
    expect(screen.getByText('Site account · demo')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('logout-btn'))
    expect(store.getState().auth.isAuthenticated).toBe(false)
    expect(localStorage.getItem('token:demo')).toBeNull()
    expect(push).toHaveBeenCalledWith('/site/demo')
  })

  it('signs out to the portal root', () => {
    renderWithStore(<UserBubble />, makeUser())
    fireEvent.click(screen.getByTestId('user-bubble-btn'))
    fireEvent.click(screen.getByTestId('logout-btn'))
    expect(push).toHaveBeenCalledWith('/')
  })
})
