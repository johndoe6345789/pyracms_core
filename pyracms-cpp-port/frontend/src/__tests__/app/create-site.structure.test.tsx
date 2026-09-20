/**
 * Tests for the create-site page: structure, title, link, heading.
 */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderPage } from '../helpers/createSitePage'

jest.mock(
  'next/link',
  () => jest.requireActual('../helpers/createSitePageMocks').MockLink,
)
jest.mock(
  '@/components/create-site/CreateSiteForm',
  () => jest.requireActual('../helpers/createSitePageMocks').MockCreateSiteForm,
)

describe('CreateSitePage', () => {
  it('renders data-testid="create-site-page"', () => {
    renderPage(false)
    expect(screen.getByTestId('create-site-page')).toBeInTheDocument()
  })

  it('root element has role="main"', () => {
    renderPage(false)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('root element has aria-label "Create new site"', () => {
    renderPage(false)
    expect(
      screen.getByRole('main', {
        name: /create new site/i,
      }),
    ).toBeInTheDocument()
  })

  it('sets document.title to "Create New Site – PyraCMS"', () => {
    renderPage(false)
    expect(document.title).toBe('Create New Site – PyraCMS')
  })

  it('renders "Back to Portal" link', () => {
    renderPage(false)
    expect(screen.getByTestId('back-to-portal-link')).toBeInTheDocument()
  })

  it('"Back to Portal" link points to /portal', () => {
    renderPage(false)
    expect(screen.getByTestId('back-to-portal-link')).toHaveAttribute(
      'href',
      '/portal',
    )
  })

  it('"Back to Portal" link has descriptive aria-label', () => {
    renderPage(false)
    expect(screen.getByTestId('back-to-portal-link')).toHaveAttribute(
      'aria-label',
      'Back to Portal',
    )
  })

  it('renders h1 heading "New Site"', () => {
    renderPage(false)
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /new site/i,
      }),
    ).toBeInTheDocument()
  })
})
