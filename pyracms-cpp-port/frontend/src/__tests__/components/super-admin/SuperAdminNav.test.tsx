/**
 * Tests for SuperAdminNav.
 *
 * SuperAdminNav renders:
 *   - A ShieldOutlined icon (aria-hidden) + "Super Admin" heading
 *   - Four nav items: Dashboard, Tenants, Users, Settings
 *   - Each item has a data-testid and links to the correct path
 *   - A secondary "Back to Portal" link to "/"
 *
 * The component uses next/link for navigation, which the Next.js
 * Jest transform resolves to a plain <a> in jsdom.
 *
 * Coverage:
 *   1. "Super Admin" heading present
 *   2. ShieldOutlined icon rendered (aria-hidden)
 *   3. All four nav items rendered by data-testid
 *   4. Each nav item links to the correct path
 *   5. "Back to Portal" link present and links to "/"
 *   6. onNavClick callback fired when a nav item is clicked
 */

import {
  render, screen, fireEvent,
} from '@testing-library/react'
import '@testing-library/jest-dom'
import SuperAdminNav
  from '@/components/super-admin/SuperAdminNav'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Expected nav item configuration. */
interface NavItem {
  testId: string
  label: string
  path: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NAV_ITEMS: NavItem[] = [
  {
    testId: 'super-admin-nav-dashboard',
    label: 'Dashboard',
    path: '/super-admin',
  },
  {
    testId: 'super-admin-nav-tenants',
    label: 'Tenants',
    path: '/super-admin/tenants',
  },
  {
    testId: 'super-admin-nav-users',
    label: 'Users',
    path: '/super-admin/users',
  },
  {
    testId: 'super-admin-nav-settings',
    label: 'Settings',
    path: '/super-admin/settings',
  },
]

const DEFAULT_WIDTH = 260

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Render with a default width. Optionally pass onNavClick. */
function renderNav(onNavClick?: jest.Mock) {
  return render(
    <SuperAdminNav
      width={DEFAULT_WIDTH}
      onNavClick={onNavClick}
    />,
  )
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('SuperAdminNav', () => {
  // -------------------------------------------------------------------------
  // Heading / branding
  // -------------------------------------------------------------------------

  describe('heading and icon', () => {
    it('renders the "Super Admin" heading', () => {
      renderNav()
      expect(
        screen.getByText('Super Admin'),
      ).toBeInTheDocument()
    })

    it('ShieldOutlined svg icon is rendered aria-hidden', () => {
      const { container } = renderNav()
      // The first svg in the component is the ShieldOutlined icon.
      const icon = container.querySelector(
        '[aria-hidden="true"] svg, svg[aria-hidden="true"]',
      )
      expect(icon).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Primary nav items – presence
  // -------------------------------------------------------------------------

  describe('primary nav items – presence', () => {
    NAV_ITEMS.forEach(({ testId, label }) => {
      it(`renders the ${label} nav item`, () => {
        renderNav()
        expect(
          screen.getByTestId(testId),
        ).toBeInTheDocument()
      })
    })

    it('renders exactly 4 primary nav items', () => {
      renderNav()
      expect(
        screen.getAllByTestId(/^super-admin-nav-(?!list)/),
      ).toHaveLength(4)
    })
  })

  // -------------------------------------------------------------------------
  // Primary nav items – hrefs
  // -------------------------------------------------------------------------

  describe('primary nav items – hrefs', () => {
    NAV_ITEMS.forEach(({ testId, label, path }) => {
      it(`${label} item links to ${path}`, () => {
        renderNav()
        expect(
          screen.getByTestId(testId),
        ).toHaveAttribute('href', path)
      })
    })
  })

  // -------------------------------------------------------------------------
  // Primary nav items – labels
  // -------------------------------------------------------------------------

  describe('primary nav items – labels', () => {
    NAV_ITEMS.forEach(({ label }) => {
      it(`renders the text "${label}"`, () => {
        renderNav()
        expect(
          screen.getByText(label),
        ).toBeInTheDocument()
      })
    })
  })

  // -------------------------------------------------------------------------
  // Nav list wrapper
  // -------------------------------------------------------------------------

  describe('nav list', () => {
    it('renders the nav list container', () => {
      renderNav()
      expect(
        screen.getByTestId('super-admin-nav-list'),
      ).toBeInTheDocument()
    })

    it('primary nav is wrapped in a <nav> with correct aria-label',
      () => {
        const { container } = renderNav()
        const nav = container.querySelector(
          'nav[aria-label="Super admin navigation"]',
        )
        expect(nav).toBeInTheDocument()
      },
    )
  })

  // -------------------------------------------------------------------------
  // Back to Portal
  // -------------------------------------------------------------------------

  describe('"Back to Portal" link', () => {
    it('renders the Back to Portal link', () => {
      renderNav()
      expect(
        screen.getByTestId('super-admin-back-portal'),
      ).toBeInTheDocument()
    })

    it('Back to Portal link points to "/"', () => {
      renderNav()
      expect(
        screen.getByTestId('super-admin-back-portal'),
      ).toHaveAttribute('href', '/')
    })

    it('Back to Portal link shows correct text', () => {
      renderNav()
      expect(
        screen.getByText('Back to Portal'),
      ).toBeInTheDocument()
    })

    it('secondary nav is wrapped in <nav> with aria-label', () => {
      const { container } = renderNav()
      const nav = container.querySelector(
        'nav[aria-label="Super admin secondary navigation"]',
      )
      expect(nav).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // onNavClick callback
  // -------------------------------------------------------------------------

  describe('onNavClick callback', () => {
    it('fires onNavClick when Dashboard is clicked', () => {
      const onNavClick = jest.fn()
      renderNav(onNavClick)
      fireEvent.click(
        screen.getByTestId('super-admin-nav-dashboard'),
      )
      expect(onNavClick).toHaveBeenCalledTimes(1)
    })

    it('fires onNavClick when Tenants is clicked', () => {
      const onNavClick = jest.fn()
      renderNav(onNavClick)
      fireEvent.click(
        screen.getByTestId('super-admin-nav-tenants'),
      )
      expect(onNavClick).toHaveBeenCalledTimes(1)
    })

    it('fires onNavClick when Users is clicked', () => {
      const onNavClick = jest.fn()
      renderNav(onNavClick)
      fireEvent.click(
        screen.getByTestId('super-admin-nav-users'),
      )
      expect(onNavClick).toHaveBeenCalledTimes(1)
    })

    it('fires onNavClick when Settings is clicked', () => {
      const onNavClick = jest.fn()
      renderNav(onNavClick)
      fireEvent.click(
        screen.getByTestId('super-admin-nav-settings'),
      )
      expect(onNavClick).toHaveBeenCalledTimes(1)
    })

    it('does not throw when onNavClick is omitted', () => {
      renderNav() // no callback passed
      expect(() =>
        fireEvent.click(
          screen.getByTestId('super-admin-nav-dashboard'),
        ),
      ).not.toThrow()
    })
  })

  // -------------------------------------------------------------------------
  // Width prop
  // -------------------------------------------------------------------------

  describe('width prop', () => {
    it('applies the supplied width to the container', () => {
      const { container } = render(
        <SuperAdminNav width={320} />,
      )
      const root = container.firstChild as HTMLElement
      // MUI Box renders width as inline style.
      expect(root).toHaveStyle({ width: '320px' })
    })
  })
})
