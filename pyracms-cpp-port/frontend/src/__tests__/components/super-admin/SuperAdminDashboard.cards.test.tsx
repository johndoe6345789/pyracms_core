/** Tests for SuperAdminDashboard: heading, subtitle, cards. */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SuperAdminDashboard from
  '@/components/super-admin/SuperAdminDashboard'

describe('SuperAdminDashboard', () => {
  beforeEach(() => {
    render(<SuperAdminDashboard />)
  })

  describe('heading', () => {
    it('renders "Platform Overview" as a heading', () => {
      expect(
        screen.getByRole('heading', {
          name: /platform overview/i,
        }),
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

  describe('subtitle', () => {
    it('renders descriptive subtitle text', () => {
      expect(
        screen.getByText(/manage all pyracms tenants/i),
      ).toBeInTheDocument()
    })
  })

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
        screen.getAllByRole('link', {
          name: new RegExp(
            'manage tenants|global users|platform settings'
            + '|create new site',
            'i',
          ),
        }),
      ).toHaveLength(4)
    })
  })
})
