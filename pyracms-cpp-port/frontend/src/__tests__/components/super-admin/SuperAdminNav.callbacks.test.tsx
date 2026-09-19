/** Tests for SuperAdminNav: onNavClick callback and width. */
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import SuperAdminNav from '@/components/super-admin/SuperAdminNav'
import { renderNav } from '../../helpers/superAdminNav'

describe('SuperAdminNav', () => {
  describe('onNavClick callback', () => {
    it('fires onNavClick when Dashboard is clicked', () => {
      const onNavClick = jest.fn()
      renderNav(onNavClick)
      fireEvent.click(screen.getByTestId('super-admin-nav-dashboard'))
      expect(onNavClick).toHaveBeenCalledTimes(1)
    })

    it('fires onNavClick when Tenants is clicked', () => {
      const onNavClick = jest.fn()
      renderNav(onNavClick)
      fireEvent.click(screen.getByTestId('super-admin-nav-tenants'))
      expect(onNavClick).toHaveBeenCalledTimes(1)
    })

    it('fires onNavClick when Users is clicked', () => {
      const onNavClick = jest.fn()
      renderNav(onNavClick)
      fireEvent.click(screen.getByTestId('super-admin-nav-users'))
      expect(onNavClick).toHaveBeenCalledTimes(1)
    })

    it('fires onNavClick when Settings is clicked', () => {
      const onNavClick = jest.fn()
      renderNav(onNavClick)
      fireEvent.click(screen.getByTestId('super-admin-nav-settings'))
      expect(onNavClick).toHaveBeenCalledTimes(1)
    })

    it('does not throw when onNavClick is omitted', () => {
      renderNav() // no callback passed
      expect(() =>
        fireEvent.click(screen.getByTestId('super-admin-nav-dashboard')),
      ).not.toThrow()
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
