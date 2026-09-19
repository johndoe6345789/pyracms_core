/** Tests for SuperAdminDashboard: card labels and text. */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SuperAdminDashboard from '@/components/super-admin/SuperAdminDashboard'

describe('SuperAdminDashboard', () => {
  beforeEach(() => {
    render(<SuperAdminDashboard />)
  })

  describe('quick-link card labels', () => {
    it('Manage Tenants card shows correct label', () => {
      expect(screen.getByTestId('quick-tenants')).toHaveTextContent(
        'Manage Tenants',
      )
    })

    it('Global Users card shows correct label', () => {
      expect(screen.getByTestId('quick-users')).toHaveTextContent(
        'Global Users',
      )
    })

    it('Platform Settings card shows correct label', () => {
      expect(screen.getByTestId('quick-settings')).toHaveTextContent(
        'Platform Settings',
      )
    })

    it('Create New Site card shows correct label', () => {
      expect(screen.getByTestId('quick-create-site')).toHaveTextContent(
        'Create New Site',
      )
    })
  })

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
        screen.getByText('Configure global PyraCMS settings'),
      ).toBeInTheDocument()
    })

    it('Create New Site shows its description', () => {
      expect(
        screen.getByText('Launch the site creation wizard'),
      ).toBeInTheDocument()
    })
  })
})
