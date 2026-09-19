/** Tests for SuperAdminBreadcrumbs: one level deep. */
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

  describe('one level deep (/super-admin/tenants)', () => {
    it('renders "Super Admin" as a link', () => {
      renderCrumbs('/super-admin/tenants')
      expect(
        screen.getByTestId('breadcrumb-link-super-admin'),
      ).toBeInTheDocument()
    })

    it('"Super Admin" link href is /super-admin', () => {
      renderCrumbs('/super-admin/tenants')
      expect(
        screen.getByTestId('breadcrumb-link-super-admin'),
      ).toHaveAttribute('href', '/super-admin')
    })

    it('renders "Tenants" as the current page crumb', () => {
      renderCrumbs('/super-admin/tenants')
      expect(
        screen.getByTestId('breadcrumb-current'),
      ).toHaveTextContent('Tenants')
    })

    it('"Tenants" crumb has aria-current="page"', () => {
      renderCrumbs('/super-admin/tenants')
      expect(
        screen.getByTestId('breadcrumb-current'),
      ).toHaveAttribute('aria-current', 'page')
    })
  })

  describe('known segment labels', () => {
    it('/super-admin/users → current = "Users"', () => {
      renderCrumbs('/super-admin/users')
      expect(
        screen.getByTestId('breadcrumb-current'),
      ).toHaveTextContent('Users')
    })

    it('/super-admin/settings → current = "Settings"', () => {
      renderCrumbs('/super-admin/settings')
      expect(
        screen.getByTestId('breadcrumb-current'),
      ).toHaveTextContent('Settings')
    })
  })
})
