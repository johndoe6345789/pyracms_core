/**
 * Tests for CreateSiteForm: heading, error alert, form element.
 *
 * Mocks useCreateSite so the component can be rendered in
 * isolation without a Redux store or real API layer.
 */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import CreateSiteForm from '@/components/create-site/CreateSiteForm'
import {
  mockUseCreateSite,
  resetCreateSite,
  withHook,
} from '../../helpers/createSiteForm'

jest.mock('@/hooks/useCreateSite', () => ({
  useCreateSite: () => mockUseCreateSite(),
}))

jest.mock(
  '@/components/create-site/CreateSiteFields',
  () => jest.requireActual('../../helpers/createSiteForm').MockFields,
)

describe('CreateSiteForm', () => {
  beforeEach(resetCreateSite)

  // ── Heading ───────────────────────────────────────────────

  it('renders heading "Create Your Site"', () => {
    render(<CreateSiteForm />)
    expect(
      screen.getByRole('heading', {
        name: /create your site/i,
      }),
    ).toBeInTheDocument()
  })

  // ── Error alert ───────────────────────────────────────────

  it('does not show an error alert by default', () => {
    render(<CreateSiteForm />)
    expect(screen.queryByTestId('create-site-error')).not.toBeInTheDocument()
  })

  it('shows an error alert when useCreateSite returns an error', () => {
    withHook({ error: 'Slug already taken' })
    render(<CreateSiteForm />)
    const alert = screen.getByTestId('create-site-error')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent('Slug already taken')
  })

  it('error alert has role="alert" and aria-live="assertive"', () => {
    withHook({ error: 'Something went wrong' })
    render(<CreateSiteForm />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('aria-live', 'assertive')
  })

  it('renders data-testid="create-site-form" on the <form>', () => {
    render(<CreateSiteForm />)
    expect(screen.getByTestId('create-site-form')).toBeInTheDocument()
  })

  it('<form> has aria-label "Create site form"', () => {
    render(<CreateSiteForm />)
    expect(
      screen.getByRole('form', { name: /create site form/i }),
    ).toBeInTheDocument()
  })
})
