/** Tests for SuperAdminGuard: authorised state. */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderGuard } from '../../helpers/superAdminGuard'

describe('SuperAdminGuard', () => {
  describe('authorised state (hydrated=true, allowed=true)', () => {
    it('renders children', () => {
      renderGuard(true, true)
      expect(
        screen.getByTestId('guarded-child'),
      ).toBeInTheDocument()
    })

    it('children show correct text', () => {
      renderGuard(true, true)
      expect(
        screen.getByText('Protected Content'),
      ).toBeInTheDocument()
    })

    it('does not render the loading spinner', () => {
      renderGuard(true, true)
      expect(
        screen.queryByRole('progressbar'),
      ).not.toBeInTheDocument()
    })

    it('does not render the access-denied container', () => {
      renderGuard(true, true)
      expect(
        screen.queryByTestId('super-admin-denied'),
      ).not.toBeInTheDocument()
    })

    it('does not render any Alert', () => {
      renderGuard(true, true)
      expect(
        screen.queryByRole('alert'),
      ).not.toBeInTheDocument()
    })
  })
})
