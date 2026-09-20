/**
 * Tests for the create-site page: anyone can create a site, because the
 * form also creates the account that will administer it.
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
  it('shows the form to visitors who are not signed in', () => {
    renderPage(false)
    expect(screen.getByTestId('mock-create-site-form')).toBeInTheDocument()
  })

  it('shows the form to signed-in visitors too', () => {
    renderPage(true)
    expect(screen.getByTestId('mock-create-site-form')).toBeInTheDocument()
  })
})
