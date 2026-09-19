/** Tests for SuperAdminAppBar: title, toolbar, children. */
import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import { renderAppBar } from '../../helpers/superAdminAppBar'

// UserBubble needs the Next.js router context; stub it.
jest.mock('next/navigation', () =>
  require('../../helpers/routerStub').navigationMock(),
)

describe('SuperAdminAppBar', () => {
  describe('title', () => {
    it('renders "PyraCMS Super Admin"', () => {
      renderAppBar(false, jest.fn())
      expect(screen.getByText('PyraCMS Super Admin')).toBeInTheDocument()
    })
  })

  describe('toolbar', () => {
    it('has data-testid="super-admin-toolbar"', () => {
      renderAppBar(false, jest.fn())
      expect(screen.getByTestId('super-admin-toolbar')).toBeInTheDocument()
    })
  })

  describe('shield icon', () => {
    it('renders the ShieldOutlined icon with aria-hidden', () => {
      const { container } = renderAppBar(false, jest.fn())
      // The aria-hidden wrapper <svg> or parent element.
      const hiddenIcon = container.querySelector('[aria-hidden="true"]')
      expect(hiddenIcon).toBeInTheDocument()
    })
  })

  describe('child controls', () => {
    it('renders the ThemeToggle button', () => {
      renderAppBar(false, jest.fn())
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
    })

    it('renders the UserBubble (guest chip or user button)', () => {
      renderAppBar(false, jest.fn())
      // Unauthenticated: UserBubble renders guest-login-link.
      expect(screen.getByTestId('guest-login-link')).toBeInTheDocument()
    })
  })
})
