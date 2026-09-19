/** Tests for SuperAdminBreadcrumbs: deep paths and icon. */
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

  describe('two levels deep (/super-admin/tenants/42)', () => {
    it('renders "Super Admin" link', () => {
      renderCrumbs('/super-admin/tenants/42')
      expect(
        screen.getByTestId('breadcrumb-link-super-admin'),
      ).toBeInTheDocument()
    })

    it('renders "Tenants" link', () => {
      renderCrumbs('/super-admin/tenants/42')
      expect(screen.getByTestId('breadcrumb-link-tenants')).toBeInTheDocument()
    })

    it('"Tenants" link href is /super-admin/tenants', () => {
      renderCrumbs('/super-admin/tenants/42')
      expect(screen.getByTestId('breadcrumb-link-tenants')).toHaveAttribute(
        'href',
        '/super-admin/tenants',
      )
    })

    it('renders "42" as the current page crumb', () => {
      renderCrumbs('/super-admin/tenants/42')
      expect(screen.getByTestId('breadcrumb-current')).toHaveTextContent('42')
    })
  })

  describe('unknown segment label fallback', () => {
    it('capitalises the first letter of an unknown slug', () => {
      renderCrumbs('/super-admin/custompage')
      expect(screen.getByTestId('breadcrumb-current')).toHaveTextContent(
        'Custompage',
      )
    })
  })

  describe('ShieldOutlined icon', () => {
    it('icon appears when Super Admin is a link crumb', () => {
      renderCrumbs('/super-admin/tenants')
      // The shield svg is aria-hidden inside the link crumb.
      const linkCrumb = screen.getByTestId('breadcrumb-link-super-admin')
      const icon = linkCrumb.querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
    })

    it('no extra icon on non-root link crumbs', () => {
      renderCrumbs('/super-admin/tenants/42')
      const tenantsCrumb = screen.getByTestId('breadcrumb-link-tenants')
      // Tenants link should not contain an aria-hidden icon.
      const icon = tenantsCrumb.querySelector('[aria-hidden="true"]')
      expect(icon).not.toBeInTheDocument()
    })
  })
})
