/** Tests for SuperAdminBreadcrumbs: container and root. */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderCrumbs } from '../../helpers/breadcrumbs'

// usePathname is mocked; jsdom has no real URL bar.
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

describe('SuperAdminBreadcrumbs', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('container', () => {
    it('renders the breadcrumbs container', () => {
      renderCrumbs('/super-admin')
      expect(screen.getByTestId('super-admin-breadcrumbs')).toBeInTheDocument()
    })

    it('breadcrumb nav has aria-label', () => {
      renderCrumbs('/super-admin')
      expect(
        screen.getByRole('navigation', {
          name: /super admin breadcrumb/i,
        }),
      ).toBeInTheDocument()
    })
  })

  describe('root route (/super-admin)', () => {
    it('shows "Super Admin" as the current page crumb', () => {
      renderCrumbs('/super-admin')
      expect(screen.getByTestId('breadcrumb-current')).toHaveTextContent(
        'Super Admin',
      )
    })

    it('marks the single crumb as aria-current="page"', () => {
      renderCrumbs('/super-admin')
      expect(screen.getByTestId('breadcrumb-current')).toHaveAttribute(
        'aria-current',
        'page',
      )
    })

    it('renders no clickable links at the root', () => {
      renderCrumbs('/super-admin')
      // No preceding link crumbs should exist.
      expect(
        screen.queryByTestId('breadcrumb-link-super-admin'),
      ).not.toBeInTheDocument()
    })
  })
})
