import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderGuard }
  from '@/__tests__/helpers/superAdminGuardHelpers'

describe('SuperAdminGuard', () => {
  describe('loading state (hydrated=false)', () => {
    it('renders a CircularProgress spinner', () => {
      renderGuard(false, false)
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
})
