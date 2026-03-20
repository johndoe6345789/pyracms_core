/**
 * Tests for CreateSiteForm component.
 *
 * Mocks useCreateSite so the component can be rendered in
 * isolation without a Redux store or real API layer.
 */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import CreateSiteForm
  from '@/components/create-site/CreateSiteForm'

// ── Mock useCreateSite ────────────────────────────────────────

/**
 * Shape returned by the real hook; we control it per-test
 * via mockReturnValue.
 */
const mockUseCreateSite = jest.fn()

jest.mock('@/hooks/useCreateSite', () => ({
  useCreateSite: () => mockUseCreateSite(),
}))

// CreateSiteFields is rendered by CreateSiteForm; stub it to
// keep these tests focused on the form shell.
jest.mock(
  '@/components/create-site/CreateSiteFields',
  () => {
    const MockFields = () => (
      <div data-testid="mock-create-site-fields" />
    )
    MockFields.displayName = 'MockCreateSiteFields'
    return MockFields
  },
)

/** Default (idle) hook return value. */
const idleHook = {
  form: { name: '', slug: '', description: '' },
  updateField: jest.fn(),
  loading: false,
  error: '',
  handleSubmit: jest.fn(),
}

describe('CreateSiteForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCreateSite.mockReturnValue(idleHook)
  })

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
    expect(
      screen.queryByTestId('create-site-error'),
    ).not.toBeInTheDocument()
  })

  it('shows an error alert when useCreateSite returns an error',
    () => {
      mockUseCreateSite.mockReturnValue({
        ...idleHook,
        error: 'Slug already taken',
      })
      render(<CreateSiteForm />)
      const alert = screen.getByTestId('create-site-error')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent('Slug already taken')
    },
  )

  it('error alert has role="alert" and aria-live="assertive"',
    () => {
      mockUseCreateSite.mockReturnValue({
        ...idleHook,
        error: 'Something went wrong',
      })
      render(<CreateSiteForm />)
      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-live', 'assertive')
    },
  )

  // ── Submit button text ────────────────────────────────────

  it('submit button shows "Create Site" when not loading', () => {
    render(<CreateSiteForm />)
    const btn = screen.getByTestId('create-site-submit')
    expect(btn).toHaveTextContent('Create Site')
  })

  it('submit button shows "Creating..." during loading', () => {
    mockUseCreateSite.mockReturnValue({
      ...idleHook,
      loading: true,
    })
    render(<CreateSiteForm />)
    const btn = screen.getByTestId('create-site-submit')
    expect(btn).toHaveTextContent('Creating...')
  })

  // ── Submit button disabled state ──────────────────────────

  it('submit button is enabled when not loading', () => {
    render(<CreateSiteForm />)
    expect(
      screen.getByTestId('create-site-submit'),
    ).not.toBeDisabled()
  })

  it('submit button is disabled during loading', () => {
    mockUseCreateSite.mockReturnValue({
      ...idleHook,
      loading: true,
    })
    render(<CreateSiteForm />)
    expect(
      screen.getByTestId('create-site-submit'),
    ).toBeDisabled()
  })

  // ── aria-label on submit button ───────────────────────────

  it('submit button has aria-label "Create site" when idle', () => {
    render(<CreateSiteForm />)
    expect(
      screen.getByTestId('create-site-submit'),
    ).toHaveAttribute('aria-label', 'Create site')
  })

  it('submit button has aria-label "Creating site" when loading',
    () => {
      mockUseCreateSite.mockReturnValue({
        ...idleHook,
        loading: true,
      })
      render(<CreateSiteForm />)
      expect(
        screen.getByTestId('create-site-submit'),
      ).toHaveAttribute('aria-label', 'Creating site')
    },
  )

  // ── data-testid on form element ───────────────────────────

  it('renders data-testid="create-site-form" on the <form>', () => {
    render(<CreateSiteForm />)
    expect(
      screen.getByTestId('create-site-form'),
    ).toBeInTheDocument()
  })

  it('<form> has aria-label "Create site form"', () => {
    render(<CreateSiteForm />)
    expect(
      screen.getByRole('form', { name: /create site form/i }),
    ).toBeInTheDocument()
  })
})
