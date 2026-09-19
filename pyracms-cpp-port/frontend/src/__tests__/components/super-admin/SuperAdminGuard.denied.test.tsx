/** Tests for SuperAdminGuard: access denied state. */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderGuard } from '../../helpers/superAdminGuard'

describe('SuperAdminGuard', () => {
  describe('access denied state (hydrated=true, allowed=false)', () => {
    it('renders an error Alert', () => {
      renderGuard(true, false)
      expect(
        screen.getByRole('alert'),
      ).toBeInTheDocument()
    })

    it('Alert contains the "Access Denied" text', () => {
      renderGuard(true, false)
      expect(
        screen.getByRole('alert'),
      ).toHaveTextContent('Access Denied')
    })

    it('Alert mentions "Super Admin privileges required"', () => {
      renderGuard(true, false)
      expect(
        screen.getByRole('alert'),
      ).toHaveTextContent(/super admin/i)
    })

    it('container has data-testid="super-admin-denied"', () => {
      renderGuard(true, false)
      expect(
        screen.getByTestId('super-admin-denied'),
      ).toBeInTheDocument()
    })

    it('does not render children when access is denied', () => {
      renderGuard(true, false)
      expect(
        screen.queryByTestId('guarded-child'),
      ).not.toBeInTheDocument()
    })

    it('does not show the loading spinner when denied', () => {
      renderGuard(true, false)
      expect(
        screen.queryByRole('progressbar'),
      ).not.toBeInTheDocument()
    })
  })
})
