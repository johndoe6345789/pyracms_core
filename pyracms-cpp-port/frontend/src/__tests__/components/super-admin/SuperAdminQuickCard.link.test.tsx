import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderCard } from '@/__tests__/helpers/quickCard'

const openLink = () =>
  screen.getByRole('link', { name: 'Manage Tenants' })

describe('SuperAdminQuickCard "Open" link', () => {
  it('renders a link labelled by the card label', () => {
    renderCard()
    expect(openLink()).toBeInTheDocument()
  })

  it('link has the correct href', () => {
    renderCard()
    expect(openLink()).toHaveAttribute('href', '/super-admin/tenants')
  })

  it('aria-label matches the label prop', () => {
    renderCard()
    expect(openLink()).toHaveAttribute('aria-label', 'Manage Tenants')
  })

  it('link text content is "Open"', () => {
    renderCard()
    expect(openLink()).toHaveTextContent('Open')
  })

  it('uses a different href when provided', () => {
    renderCard({ label: 'Create New Site', href: '/create-site' })
    expect(
      screen.getByRole('link', { name: 'Create New Site' }),
    ).toHaveAttribute('href', '/create-site')
  })
})
