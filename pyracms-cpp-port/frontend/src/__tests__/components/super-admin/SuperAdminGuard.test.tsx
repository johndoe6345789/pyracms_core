/**
 * Tests for SuperAdminGuard.
 *
 * SuperAdminGuard gate-keeps the super-admin layout based on
 * two boolean flags:
 *
 *   hydrated – whether the client-side store has rehydrated
 *   allowed  – whether the current user holds SuperAdmin role
 *
 * Coverage:
 *   1. Shows CircularProgress while hydrated=false
 *   2. Shows "Access Denied" Alert when hydrated=true, allowed=false
 *   3. data-testid="super-admin-denied" on the denial container
 *   4. Renders children when hydrated=true, allowed=true
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SuperAdminGuard
  from '@/components/super-admin/SuperAdminGuard'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Render the guard with a simple text child. */
function renderGuard(
  hydrated: boolean,
  allowed: boolean,
) {
  return render(
    <SuperAdminGuard hydrated={hydrated} allowed={allowed}>
      <div data-testid="guarded-child">Protected Content</div>
    </SuperAdminGuard>,
  )
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('SuperAdminGuard', () => {
  describe('loading state (hydrated=false)', () => {
    it('renders a CircularProgress spinner', () => {
      renderGuard(false, false)
      // MUI CircularProgress renders with role="progressbar" by default.
      expect(
        screen.getByRole('progressbar'),
      ).toBeInTheDocument()
    })

    it('spinner has accessible aria-label "Loading"', () => {
      renderGuard(false, false)
      expect(
        screen.getByLabelText('Loading'),
      ).toBeInTheDocument()
    })

    it('does not render children while loading', () => {
      renderGuard(false, true)
      expect(
        screen.queryByTestId('guarded-child'),
      ).not.toBeInTheDocument()
    })

    it('does not render the access-denied container while loading',
      () => {
        renderGuard(false, false)
        expect(
          screen.queryByTestId('super-admin-denied'),
        ).not.toBeInTheDocument()
      },
    )
  })

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
