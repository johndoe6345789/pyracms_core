/**
 * Tests for SuperAdminBreadcrumbs.
 *
 * SuperAdminBreadcrumbs renders a MUI Breadcrumbs trail derived
 * from the current Next.js pathname.  Each path segment becomes
 * one crumb; the final segment is the "current page" (aria-current)
 * and all prior segments are clickable links.
 *
 * next/navigation's usePathname is mocked so every test can supply
 * an arbitrary pathname without a real router context.
 *
 * Coverage:
 *   1. data-testid="super-admin-breadcrumbs" container present
 *   2. aria-label on the <nav> element
 *   3. Root route ("/super-admin") – single crumb, no links
 *   4. One-level deep ("/super-admin/tenants") – link + current
 *   5. Two-levels deep ("/super-admin/tenants/42") – 2 links + current
 *   6. Known labels resolved (tenants→Tenants, users→Users, etc.)
 *   7. Unknown segment capitalised and used as label
 *   8. aria-current="page" on the current crumb
 *   9. data-testid="breadcrumb-current" on the active crumb
 *  10. data-testid on preceding links
 *  11. ShieldOutlined icon only on the "super-admin" link
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SuperAdminBreadcrumbs
  from '@/components/super-admin/SuperAdminBreadcrumbs'

// ---------------------------------------------------------------------------
// Mock next/navigation
// ---------------------------------------------------------------------------

// next/jest auto-transforms next/link, but usePathname must be
// manually mocked because jsdom has no real URL bar.
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

// Import the mock *after* jest.mock so we get the spy reference.
import { usePathname } from 'next/navigation'

const mockUsePathname = usePathname as jest.Mock

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Render breadcrumbs with a specific pathname. */
function renderCrumbs(pathname: string) {
  mockUsePathname.mockReturnValue(pathname)
  return render(<SuperAdminBreadcrumbs />)
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('SuperAdminBreadcrumbs', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  // -------------------------------------------------------------------------
  // Container
  // -------------------------------------------------------------------------

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

  // -------------------------------------------------------------------------
  // Root route: /super-admin
  // -------------------------------------------------------------------------

  describe('root route (/super-admin)', () => {
    it('shows "Super Admin" as the current page crumb', () => {
      renderCrumbs('/super-admin')
      expect(
        screen.getByTestId('breadcrumb-current'),
      ).toHaveTextContent('Super Admin')
    })

    it('marks the single crumb as aria-current="page"', () => {
      renderCrumbs('/super-admin')
      expect(
        screen.getByTestId('breadcrumb-current'),
      ).toHaveAttribute('aria-current', 'page')
    })

    it('renders no clickable links at the root', () => {
      renderCrumbs('/super-admin')
      // No preceding link crumbs should exist.
      expect(
        screen.queryByTestId('breadcrumb-link-super-admin'),
      ).not.toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // One level deep: /super-admin/tenants
  // -------------------------------------------------------------------------

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

  // -------------------------------------------------------------------------
  // One level deep – other known segments
  // -------------------------------------------------------------------------

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

  // -------------------------------------------------------------------------
  // Two levels deep: /super-admin/tenants/42
  // -------------------------------------------------------------------------

  describe('two levels deep (/super-admin/tenants/42)', () => {
    it('renders "Super Admin" link', () => {
      renderCrumbs('/super-admin/tenants/42')
      expect(
        screen.getByTestId('breadcrumb-link-super-admin'),
      ).toBeInTheDocument()
    })

    it('renders "Tenants" link', () => {
      renderCrumbs('/super-admin/tenants/42')
      expect(
        screen.getByTestId('breadcrumb-link-tenants'),
      ).toBeInTheDocument()
    })

    it('"Tenants" link href is /super-admin/tenants', () => {
      renderCrumbs('/super-admin/tenants/42')
      expect(
        screen.getByTestId('breadcrumb-link-tenants'),
      ).toHaveAttribute('href', '/super-admin/tenants')
    })

    it('renders "42" as the current page crumb', () => {
      renderCrumbs('/super-admin/tenants/42')
      expect(
        screen.getByTestId('breadcrumb-current'),
      ).toHaveTextContent('42')
    })
  })

  // -------------------------------------------------------------------------
  // Unknown segment capitalisation
  // -------------------------------------------------------------------------

  describe('unknown segment label fallback', () => {
    it('capitalises the first letter of an unknown slug', () => {
      renderCrumbs('/super-admin/custompage')
      expect(
        screen.getByTestId('breadcrumb-current'),
      ).toHaveTextContent('Custompage')
    })
  })

  // -------------------------------------------------------------------------
  // Shield icon only on the "super-admin" link
  // -------------------------------------------------------------------------

  describe('ShieldOutlined icon', () => {
    it('icon appears when Super Admin is a link crumb', () => {
      const { container } = renderCrumbs(
        '/super-admin/tenants',
      )
      // The shield svg is aria-hidden inside the link crumb.
      const linkCrumb = screen.getByTestId(
        'breadcrumb-link-super-admin',
      )
      const icon = linkCrumb.querySelector(
        '[aria-hidden="true"]',
      )
      expect(icon).toBeInTheDocument()
    })

    it('no extra icon on non-root link crumbs', () => {
      const { container } = renderCrumbs(
        '/super-admin/tenants/42',
      )
      const tenantsCrumb = screen.getByTestId(
        'breadcrumb-link-tenants',
      )
      // Tenants link should not contain an aria-hidden icon.
      const icon = tenantsCrumb.querySelector(
        '[aria-hidden="true"]',
      )
      expect(icon).not.toBeInTheDocument()
    })
  })
})
