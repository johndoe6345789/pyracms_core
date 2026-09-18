import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SuperAdminDashboard
  from '@/components/super-admin/SuperAdminDashboard'

describe('SuperAdminDashboard', () => {
  beforeEach(() => {
    render(<SuperAdminDashboard />)
  })

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
