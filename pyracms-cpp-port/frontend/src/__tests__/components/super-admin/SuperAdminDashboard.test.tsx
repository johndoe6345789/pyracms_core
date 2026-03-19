/**
 * Tests for SuperAdminDashboard.
 *
 * SuperAdminDashboard is a purely presentational component that
 * renders a "Platform Overview" heading and four quick-link cards.
 * It has no Redux dependency.
 *
 * Coverage:
 *   1. "Platform Overview" heading present
 *   2. data-testid="super-admin-dashboard-title" on the heading
 *   3. Subtitle / description text present
 *   4. All four quick cards rendered by data-testid
 *   5. Each card's "Open" button is a link with the correct href
 *   6. Each card renders the correct label and description text
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SuperAdminDashboard
  from '@/components/super-admin/SuperAdminDashboard'

// next/link renders <a> tags in the jsdom environment when the
// Next.js jest transform is active (provided by next/jest).

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('SuperAdminDashboard', () => {
  beforeEach(() => {
    render(<SuperAdminDashboard />)
  })

  // -------------------------------------------------------------------------
  // Heading
  // -------------------------------------------------------------------------

  describe('heading', () => {
    it('renders "Platform Overview" as a heading', () => {
      expect(
        screen.getByRole('heading', { name: /platform overview/i }),
      ).toBeInTheDocument()
    })

    it('has data-testid="super-admin-dashboard-title"', () => {
      expect(
        screen.getByTestId('super-admin-dashboard-title'),
      ).toBeInTheDocument()
    })

    it('title element contains the text "Platform Overview"', () => {
      expect(
        screen.getByTestId('super-admin-dashboard-title'),
      ).toHaveTextContent('Platform Overview')
    })
  })

  // -------------------------------------------------------------------------
  // Subtitle
  // -------------------------------------------------------------------------

  describe('subtitle', () => {
    it('renders descriptive subtitle text', () => {
      expect(
        screen.getByText(/manage all pyracms tenants/i),
      ).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Quick-link cards – presence
  // -------------------------------------------------------------------------

  describe('quick-link cards presence', () => {
    it('renders the Manage Tenants card', () => {
      expect(
        screen.getByTestId('quick-tenants'),
      ).toBeInTheDocument()
    })

    it('renders the Global Users card', () => {
      expect(
        screen.getByTestId('quick-users'),
      ).toBeInTheDocument()
    })

    it('renders the Platform Settings card', () => {
      expect(
        screen.getByTestId('quick-settings'),
      ).toBeInTheDocument()
    })

    it('renders the Create New Site card', () => {
      expect(
        screen.getByTestId('quick-create-site'),
      ).toBeInTheDocument()
    })

    it('renders exactly 4 cards', () => {
      // Each card has an "Open" button; count them as a proxy.
      expect(
        screen.getAllByRole('link', { name: /manage tenants|global users|platform settings|create new site/i }),
      ).toHaveLength(4)
    })
  })

  // -------------------------------------------------------------------------
  // Quick-link cards – labels
  // -------------------------------------------------------------------------

  describe('quick-link card labels', () => {
    it('Manage Tenants card shows correct label', () => {
      expect(
        screen.getByTestId('quick-tenants'),
      ).toHaveTextContent('Manage Tenants')
    })

    it('Global Users card shows correct label', () => {
      expect(
        screen.getByTestId('quick-users'),
      ).toHaveTextContent('Global Users')
    })

    it('Platform Settings card shows correct label', () => {
      expect(
        screen.getByTestId('quick-settings'),
      ).toHaveTextContent('Platform Settings')
    })

    it('Create New Site card shows correct label', () => {
      expect(
        screen.getByTestId('quick-create-site'),
      ).toHaveTextContent('Create New Site')
    })
  })

  // -------------------------------------------------------------------------
  // Quick-link cards – descriptions
  // -------------------------------------------------------------------------

  describe('quick-link card descriptions', () => {
    it('Manage Tenants shows its description', () => {
      expect(
        screen.getByText('Create, view and delete sites'),
      ).toBeInTheDocument()
    })

    it('Global Users shows its description', () => {
      expect(
        screen.getByText('Manage users and assign roles'),
      ).toBeInTheDocument()
    })

    it('Platform Settings shows its description', () => {
      expect(
        screen.getByText(
          'Configure global PyraCMS settings',
        ),
      ).toBeInTheDocument()
    })

    it('Create New Site shows its description', () => {
      expect(
        screen.getByText(
          'Launch the site creation wizard',
        ),
      ).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Quick-link cards – hrefs
  // -------------------------------------------------------------------------

  describe('quick-link card hrefs', () => {
    it('Manage Tenants Open button links to /super-admin/tenants',
      () => {
        const link = screen.getByRole('link', {
          name: 'Manage Tenants',
        })
        expect(link).toHaveAttribute(
          'href', '/super-admin/tenants',
        )
      },
    )

    it('Global Users Open button links to /super-admin/users', () => {
      const link = screen.getByRole('link', {
        name: 'Global Users',
      })
      expect(link).toHaveAttribute(
        'href', '/super-admin/users',
      )
    })

    it('Platform Settings Open button links to /super-admin/settings',
      () => {
        const link = screen.getByRole('link', {
          name: 'Platform Settings',
        })
        expect(link).toHaveAttribute(
          'href', '/super-admin/settings',
        )
      },
    )

    it('Create New Site Open button links to /create-site', () => {
      const link = screen.getByRole('link', {
        name: 'Create New Site',
      })
      expect(link).toHaveAttribute('href', '/create-site')
    })
  })
})
