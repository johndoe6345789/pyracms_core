import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SuperAdminNav from '@/components/super-admin/SuperAdminNav'
import { renderNav } from '@/__tests__/helpers/superAdminNav'

describe('SuperAdminNav layout', () => {
  describe('heading and icon', () => {
    it('renders the "Super Admin" heading', () => {
      renderNav()
      expect(screen.getByText('Super Admin')).toBeInTheDocument()
    })

    it('ShieldOutlined svg icon is rendered aria-hidden', () => {
      const { container } = renderNav()
      // The first svg in the component is the ShieldOutlined icon.
      const icon = container.querySelector(
        '[aria-hidden="true"] svg, svg[aria-hidden="true"]',
      )
      expect(icon).toBeInTheDocument()
    })
  })

  describe('nav list', () => {
    it('renders the nav list container', () => {
      renderNav()
      expect(
        screen.getByTestId('super-admin-nav-list'),
      ).toBeInTheDocument()
    })

    it('primary nav is wrapped in a <nav> with correct aria-label',
      () => {
        const { container } = renderNav()
        const nav = container.querySelector(
          'nav[aria-label="Super admin navigation"]',
        )
        expect(nav).toBeInTheDocument()
      },
    )
  })

  describe('"Back to Portal" link', () => {
    const back = () => screen.getByTestId('super-admin-back-portal')

    it('renders the Back to Portal link', () => {
      renderNav()
      expect(back()).toBeInTheDocument()
    })

    it('Back to Portal link points to "/"', () => {
      renderNav()
      expect(back()).toHaveAttribute('href', '/')
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

  describe('width prop', () => {
    it('applies the supplied width to the container', () => {
      const { container } = render(<SuperAdminNav width={320} />)
      const root = container.firstChild as HTMLElement
      // MUI Box renders width as inline style.
      expect(root).toHaveStyle({ width: '320px' })
    })
  })
})
