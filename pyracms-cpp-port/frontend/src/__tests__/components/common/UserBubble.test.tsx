import { screen } from '@testing-library/react'
import UserBubble from '@/components/common/UserBubble'
import { renderWithStore, makeUser } from '../../helpers/renderWithStore'
import { nav, resetNav } from '../../helpers/userBubbleNav'

jest.mock(
  'next/navigation',
  () => jest.requireActual('../../helpers/userBubbleNav').navMock,
)

describe('UserBubble', () => {
  beforeEach(resetNav)

  it('shows a plain sign-in chip on the portal', () => {
    renderWithStore(<UserBubble />)
    const chip = screen.getByTestId('guest-login-link')
    expect(chip).toHaveAttribute('href', '/auth/login')
    expect(chip).toHaveTextContent('Sign in')
  })

  it('links a site guest back to that site', () => {
    nav.params = { slug: 'demo' }
    renderWithStore(<UserBubble />)
    const href = screen.getByTestId('guest-login-link').getAttribute('href')
    expect(href).toContain('tenant=demo')
    expect(href).toContain('redirect=%2Fsite%2Fdemo%2Fforum')
  })

  it('treats a session for another site as a guest', () => {
    nav.params = { slug: 'demo' }
    renderWithStore(<UserBubble />, makeUser({ tenantSlug: 'other' }))
    expect(screen.getByTestId('guest-login-link')).toHaveTextContent(
      'Sign in here',
    )
  })
})
