import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderCrumbs } from '@/__tests__/helpers/superAdminCrumbs'

jest.mock('next/navigation', () => ({ usePathname: jest.fn() }))

const current = () => screen.getByTestId('breadcrumb-current')

describe('SuperAdminBreadcrumbs', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('container', () => {
    it('renders the breadcrumbs container', () => {
      renderCrumbs('/super-admin')
      expect(
        screen.getByTestId('super-admin-breadcrumbs'),
      ).toBeInTheDocument()
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
      expect(current()).toHaveTextContent('Super Admin')
    })

    it('marks the single crumb as aria-current="page"', () => {
      renderCrumbs('/super-admin')
      expect(current()).toHaveAttribute('aria-current', 'page')
    })

    it('renders no clickable links at the root', () => {
      renderCrumbs('/super-admin')
      // No preceding link crumbs should exist.
      expect(
        screen.queryByTestId('breadcrumb-link-super-admin'),
      ).not.toBeInTheDocument()
    })
  })

  describe('known segment labels', () => {
    it('/super-admin/users → current = "Users"', () => {
      renderCrumbs('/super-admin/users')
      expect(current()).toHaveTextContent('Users')
    })

    it('/super-admin/settings → current = "Settings"', () => {
      renderCrumbs('/super-admin/settings')
      expect(current()).toHaveTextContent('Settings')
    })
  })

  describe('unknown segment label fallback', () => {
    it('capitalises the first letter of an unknown slug', () => {
      renderCrumbs('/super-admin/custompage')
      expect(current()).toHaveTextContent('Custompage')
    })
  })
})
