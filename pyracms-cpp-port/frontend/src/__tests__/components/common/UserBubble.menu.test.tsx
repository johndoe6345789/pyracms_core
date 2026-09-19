import { screen, fireEvent } from '@testing-library/react'
import UserBubble from '@/components/common/UserBubble'
import { renderWithStore, makeUser } from '../../helpers/renderWithStore'
import { setToken } from '@/lib/session'
import { UserRole } from '@/types'
import { nav, resetNav } from '../../helpers/userBubbleNav'

jest.mock(
  'next/navigation',
  () => require('../../helpers/userBubbleNav').navMock,
)

describe('UserBubble', () => {
  beforeEach(resetNav)

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
    nav.params = { slug: 'demo' }
    setToken('demo', 'tok')
    const { store } = renderWithStore(
      <UserBubble />,
      makeUser({ tenantSlug: 'demo' }),
    )
    fireEvent.click(screen.getByTestId('user-bubble-btn'))
    expect(screen.getByTestId('admin-link')).toBeInTheDocument()
    expect(screen.getByTestId('settings-link')).toBeInTheDocument()
    expect(screen.getByText('Site account · demo')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('logout-btn'))
    expect(store.getState().auth.isAuthenticated).toBe(false)
    expect(localStorage.getItem('token:demo')).toBeNull()
    expect(nav.push).toHaveBeenCalledWith('/site/demo')
  })

  it('signs out to the portal root', () => {
    renderWithStore(<UserBubble />, makeUser())
    fireEvent.click(screen.getByTestId('user-bubble-btn'))
    fireEvent.click(screen.getByTestId('logout-btn'))
    expect(nav.push).toHaveBeenCalledWith('/')
  })
})
