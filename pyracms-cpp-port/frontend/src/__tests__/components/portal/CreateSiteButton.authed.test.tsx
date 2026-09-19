import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderButton } from '../../helpers/createSiteButton'

describe('CreateSiteButton', () => {
  describe('when the user IS authenticated', () => {
    beforeEach(() => renderButton(true))

    it('renders a button/link with data-testid', () => {
      expect(
        screen.getByTestId('create-site-button'),
      ).toBeInTheDocument()
    })

    it('links to /create-site', () => {
      const btn = screen.getByTestId('create-site-button')
      expect(btn.closest('a')).toHaveAttribute(
        'href',
        '/create-site',
      )
    })

    it('has aria-label "Create a new site"', () => {
      expect(
        screen.getByTestId('create-site-button'),
      ).toHaveAttribute('aria-label', 'Create a new site')
    })

    it('displays "Create New Site" button text', () => {
      expect(
        screen.getByTestId('create-site-button'),
      ).toHaveTextContent('Create New Site')
    })
  })
})
