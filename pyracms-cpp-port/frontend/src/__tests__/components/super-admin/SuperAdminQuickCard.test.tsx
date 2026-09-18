/**
 * Tests for SuperAdminQuickCard.
 *
 * SuperAdminQuickCard is a purely presentational Card that renders:
 *   - An icon (aria-hidden container)
 *   - A label (Typography h6)
 *   - A description (Typography body2)
 *   - An "Open" Button rendered as a next/link <a> with correct href
 *   - aria-label on the Open button matching the card label
 *   - data-testid on the Card root matching the testId prop
 *
 * Coverage:
 *   1. Renders the label text
 *   2. Renders the description text
 *   3. "Open" link has correct href
 *   4. "Open" link has aria-label equal to the label prop
 *   5. Card root has the supplied data-testid
 *   6. Icon container is aria-hidden
 *   7. Renders multiple cards independently
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DnsOutlined } from '@mui/icons-material'
import SuperAdminQuickCard
  from '@/components/super-admin/SuperAdminQuickCard'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal valid props for SuperAdminQuickCard. */
const DEFAULT_PROPS = {
  label: 'Manage Tenants',
  description: 'Create, view and delete sites',
  icon: <DnsOutlined data-testid="card-icon" />,
  href: '/super-admin/tenants',
  testId: 'quick-tenants',
}

function renderCard(
  overrides: Partial<typeof DEFAULT_PROPS> = {},
) {
  const props = { ...DEFAULT_PROPS, ...overrides }
  return render(<SuperAdminQuickCard {...props} />)
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('SuperAdminQuickCard', () => {
  // -------------------------------------------------------------------------
  // Card root
  // -------------------------------------------------------------------------

  describe('card root', () => {
    it('applies the testId prop as data-testid', () => {
      renderCard()
      expect(
        screen.getByTestId('quick-tenants'),
      ).toBeInTheDocument()
    })

    it('uses a different testId when provided', () => {
      renderCard({ testId: 'quick-users' })
      expect(
        screen.getByTestId('quick-users'),
      ).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Label
  // -------------------------------------------------------------------------

  describe('label', () => {
    it('renders the label text', () => {
      renderCard()
      expect(
        screen.getByText('Manage Tenants'),
      ).toBeInTheDocument()
    })

    it('renders a different label when provided', () => {
      renderCard({ label: 'Global Users' })
      expect(
        screen.getByText('Global Users'),
      ).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Description
  // -------------------------------------------------------------------------

  describe('description', () => {
    it('renders the description text', () => {
      renderCard()
      expect(
        screen.getByText('Create, view and delete sites'),
      ).toBeInTheDocument()
    })

    it('renders a different description when provided', () => {
      const desc = 'Manage users and assign roles'
      renderCard({ description: desc })
      expect(screen.getByText(desc)).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Icon
  // -------------------------------------------------------------------------

  describe('icon container', () => {
    it('icon wrapper has aria-hidden="true"', () => {
      const { container } = renderCard()
      const iconWrapper = container.querySelector(
        '[aria-hidden="true"]',
      )
      expect(iconWrapper).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Open button / link
  // -------------------------------------------------------------------------

  describe('"Open" link', () => {
    it('renders a link labelled by the card label', () => {
      renderCard()
      expect(
        screen.getByRole('link', { name: 'Manage Tenants' }),
      ).toBeInTheDocument()
    })

    it('link has the correct href', () => {
      renderCard()
      expect(
        screen.getByRole('link', { name: 'Manage Tenants' }),
      ).toHaveAttribute('href', '/super-admin/tenants')
    })

    it('aria-label matches the label prop', () => {
      renderCard()
      const link = screen.getByRole('link', {
        name: 'Manage Tenants',
      })
      expect(link).toHaveAttribute('aria-label', 'Manage Tenants')
    })

    it('link text content is "Open"', () => {
      renderCard()
      const link = screen.getByRole('link', {
        name: 'Manage Tenants',
      })
      expect(link).toHaveTextContent('Open')
    })

    it('uses a different href when provided', () => {
      renderCard({
        label: 'Create New Site',
        href: '/create-site',
      })
      expect(
        screen.getByRole('link', { name: 'Create New Site' }),
      ).toHaveAttribute('href', '/create-site')
    })
  })

  // -------------------------------------------------------------------------
  // Multiple independent cards
  // -------------------------------------------------------------------------

  describe('independence of multiple cards', () => {
    it('two cards rendered side by side have distinct testIds', () => {
      render(
        <>
          <SuperAdminQuickCard
            label="Manage Tenants"
            description="desc A"
            icon={<DnsOutlined />}
            href="/super-admin/tenants"
            testId="quick-tenants"
          />
          <SuperAdminQuickCard
            label="Global Users"
            description="desc B"
            icon={<DnsOutlined />}
            href="/super-admin/users"
            testId="quick-users"
          />
        </>,
      )
      expect(
        screen.getByTestId('quick-tenants'),
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('quick-users'),
      ).toBeInTheDocument()
    })

    it('two cards do not share label text', () => {
      render(
        <>
          <SuperAdminQuickCard
            label="Manage Tenants"
            description="desc A"
            icon={<DnsOutlined />}
            href="/super-admin/tenants"
            testId="quick-tenants"
          />
          <SuperAdminQuickCard
            label="Global Users"
            description="desc B"
            icon={<DnsOutlined />}
            href="/super-admin/users"
            testId="quick-users"
          />
        </>,
      )
      expect(
        screen.queryByText('Global Users'),
      ).toBeInTheDocument()
      expect(
        screen.queryByText('Manage Tenants'),
      ).toBeInTheDocument()
    })
  })
})
