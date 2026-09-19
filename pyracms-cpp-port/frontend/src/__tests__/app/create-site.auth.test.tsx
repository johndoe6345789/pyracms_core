/**
 * Tests for the create-site page: auth-dependent children.
 */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderPage } from '../helpers/createSitePage'

jest.mock(
  'next/link',
  () => jest.requireActual('../helpers/createSitePageMocks').MockLink,
)
jest.mock(
  '@/components/create-site/AuthPromptCard',
  () => jest.requireActual('../helpers/createSitePageMocks').MockAuthPromptCard,
)
jest.mock(
  '@/components/create-site/CreateSiteForm',
  () => jest.requireActual('../helpers/createSitePageMocks').MockCreateSiteForm,
)

describe('CreateSitePage', () => {
  it('shows AuthPromptCard when not authenticated', () => {
    renderPage(false)
    expect(screen.getByTestId('mock-auth-prompt-card')).toBeInTheDocument()
  })

  it('does not show CreateSiteForm when not authenticated', () => {
    renderPage(false)
    expect(
      screen.queryByTestId('mock-create-site-form'),
    ).not.toBeInTheDocument()
  })

  it('shows CreateSiteForm when authenticated', () => {
    renderPage(true)
    expect(screen.getByTestId('mock-create-site-form')).toBeInTheDocument()
  })

  it('does not show AuthPromptCard when authenticated', () => {
    renderPage(true)
    expect(
      screen.queryByTestId('mock-auth-prompt-card'),
    ).not.toBeInTheDocument()
  })
})
