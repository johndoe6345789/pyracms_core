/**
 * Tests for CreateSiteFields: slug helper text and values.
 */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { filledForm, renderFields } from '../../helpers/createSiteFields'

describe('CreateSiteFields', () => {
  // ── Slug helper text ──────────────────────────────────────

  it('shows "Auto-filled from name" when slug is empty', () => {
    renderFields()
    expect(screen.getByText('Auto-filled from name')).toBeInTheDocument()
  })

  it('shows /site/{slug} URL when slug is set', () => {
    renderFields(filledForm)
    expect(
      screen.getByText('Your site will be at /site/my-site'),
    ).toBeInTheDocument()
  })

  // ── Current values are reflected in inputs ────────────────

  it('reflects form.name value in the name input', () => {
    renderFields(filledForm)
    expect(screen.getByTestId('site-name-input')).toHaveValue('My Site')
  })

  it('reflects form.slug value in the slug input', () => {
    renderFields(filledForm)
    expect(screen.getByTestId('site-slug-input')).toHaveValue('my-site')
  })

  it('reflects form.description value in the description input', () => {
    renderFields(filledForm)
    expect(screen.getByTestId('site-description-input')).toHaveValue(
      'A test site',
    )
  })
})
