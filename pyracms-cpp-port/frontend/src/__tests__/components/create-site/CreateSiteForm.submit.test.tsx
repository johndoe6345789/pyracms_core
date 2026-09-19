/**
 * Tests for CreateSiteForm: submit button text, disabled
 * state and aria-label.
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

// Stub CreateSiteFields to keep these tests on the form shell.
jest.mock(
  '@/components/create-site/CreateSiteFields',
  () => jest.requireActual('../../helpers/createSiteForm').MockFields,
)

describe('CreateSiteForm', () => {
  beforeEach(resetCreateSite)

  // ── Submit button text ────────────────────────────────────

  it('submit button shows "Create Site" when not loading', () => {
    render(<CreateSiteForm />)
    const btn = screen.getByTestId('create-site-submit')
    expect(btn).toHaveTextContent('Create Site')
  })

  it('submit button shows "Creating..." during loading', () => {
    withHook({ loading: true })
    render(<CreateSiteForm />)
    const btn = screen.getByTestId('create-site-submit')
    expect(btn).toHaveTextContent('Creating...')
  })

  // ── Submit button disabled state ──────────────────────────

  it('submit button is enabled when not loading', () => {
    render(<CreateSiteForm />)
    expect(screen.getByTestId('create-site-submit')).not.toBeDisabled()
  })

  it('submit button is disabled during loading', () => {
    withHook({ loading: true })
    render(<CreateSiteForm />)
    expect(screen.getByTestId('create-site-submit')).toBeDisabled()
  })

  // ── aria-label on submit button ───────────────────────────

  it('submit button has aria-label "Create site" when idle', () => {
    render(<CreateSiteForm />)
    expect(screen.getByTestId('create-site-submit')).toHaveAttribute(
      'aria-label',
      'Create site',
    )
  })

  it('submit button has aria-label "Creating site" when loading', () => {
    withHook({ loading: true })
    render(<CreateSiteForm />)
    expect(screen.getByTestId('create-site-submit')).toHaveAttribute(
      'aria-label',
      'Creating site',
    )
  })
})
