/** Tests for SuperAdminNav: hrefs, nav list, Back to Portal. */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { NAV_ITEMS, renderNav } from '../../helpers/superAdminNav'

describe('SuperAdminNav', () => {
  describe('primary nav items – hrefs', () => {
    NAV_ITEMS.forEach(({ testId, label, path }) => {
      it(`${label} item links to ${path}`, () => {
        renderNav()
        expect(screen.getByTestId(testId)).toHaveAttribute('href', path)
      })
    })
  })

  describe('nav list', () => {
    it('renders the nav list container', () => {
      renderNav()
      expect(screen.getByTestId('super-admin-nav-list')).toBeInTheDocument()
    })

    it('primary nav is wrapped in a <nav> with correct aria-label', () => {
      const { container } = renderNav()
      const nav = container.querySelector(
        'nav[aria-label="Super admin navigation"]',
      )
      expect(nav).toBeInTheDocument()
    })
  })

  describe('"Back to Portal" link', () => {
    it('renders the Back to Portal link', () => {
      renderNav()
      expect(screen.getByTestId('super-admin-back-portal')).toBeInTheDocument()
    })

    it('Back to Portal link points to "/"', () => {
      renderNav()
      expect(screen.getByTestId('super-admin-back-portal')).toHaveAttribute(
        'href',
        '/',
      )
    })

    it('Back to Portal link shows correct text', () => {
      renderNav()
      expect(screen.getByText('Back to Portal')).toBeInTheDocument()
    })

    it('secondary nav is wrapped in <nav> with aria-label', () => {
      const { container } = renderNav()
      const nav = container.querySelector(
        'nav[aria-label="Super admin secondary navigation"]',
      )
      expect(nav).toBeInTheDocument()
    })
  })
})
