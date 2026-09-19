/**
 * Tests for CreateSiteFields: rendering and aria-labels.
 */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderFields } from '../../helpers/createSiteFields'

describe('CreateSiteFields', () => {
  // ── Renders all three fields ──────────────────────────────

  it('renders the Site Name input', () => {
    renderFields()
    const input = screen.getByTestId('site-name-input')
    expect(input).toBeInTheDocument()
  })

  it('renders the URL Slug input', () => {
    renderFields()
    expect(
      screen.getByTestId('site-slug-input'),
    ).toBeInTheDocument()
  })

  it('renders the Description input', () => {
    renderFields()
    expect(
      screen.getByTestId('site-description-input'),
    ).toBeInTheDocument()
  })

  // ── aria-label attributes ─────────────────────────────────

  it('site name input has aria-label "Site name"', () => {
    renderFields()
    expect(
      screen.getByTestId('site-name-input'),
    ).toHaveAttribute('aria-label', 'Site name')
  })

  it('slug input has aria-label "URL slug"', () => {
    renderFields()
    expect(
      screen.getByTestId('site-slug-input'),
    ).toHaveAttribute('aria-label', 'URL slug')
  })

  it('description input has aria-label "Site description"', () => {
    renderFields()
    expect(
      screen.getByTestId('site-description-input'),
    ).toHaveAttribute('aria-label', 'Site description')
  })
})
