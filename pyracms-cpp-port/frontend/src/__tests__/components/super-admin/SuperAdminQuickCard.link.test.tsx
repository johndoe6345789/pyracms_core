/** Tests for the SuperAdminQuickCard "Open" link. */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderCard } from '../../helpers/superAdminQuickCardHelpers'

describe('SuperAdminQuickCard', () => {
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
})
