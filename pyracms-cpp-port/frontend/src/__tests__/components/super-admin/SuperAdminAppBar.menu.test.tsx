/** Tests for SuperAdminAppBar: mobile menu toggle. */
import '@testing-library/jest-dom'
import { screen, fireEvent } from '@testing-library/react'
import { renderAppBar } from '../../helpers/superAdminAppBar'

// UserBubble needs the Next.js router context; stub it.
jest.mock('next/navigation', () =>
  require('../../helpers/routerStub').navigationMock())

describe('SuperAdminAppBar', () => {
  describe('menu toggle (isMobile=false)', () => {
    it('does not render the menu toggle button', () => {
      renderAppBar(false, jest.fn())
      expect(
        screen.queryByTestId('super-admin-menu-toggle'),
      ).not.toBeInTheDocument()
    })

    it('does not render a button labelled "Open super admin menu"',
      () => {
        renderAppBar(false, jest.fn())
        expect(
          screen.queryByRole('button', {
            name: /open super admin menu/i,
          }),
        ).not.toBeInTheDocument()
      },
    )
  })

  describe('menu toggle (isMobile=true)', () => {
    it('renders the menu toggle button', () => {
      renderAppBar(true, jest.fn())
      expect(
        screen.getByTestId('super-admin-menu-toggle'),
      ).toBeInTheDocument()
    })

    it('button has aria-label "Open super admin menu"', () => {
      renderAppBar(true, jest.fn())
      expect(
        screen.getByRole('button', {
          name: /open super admin menu/i,
        }),
      ).toBeInTheDocument()
    })

    it('calls onMenuClick when the toggle is clicked', () => {
      const onMenuClick = jest.fn()
      renderAppBar(true, onMenuClick)
      fireEvent.click(
        screen.getByTestId('super-admin-menu-toggle'),
      )
      expect(onMenuClick).toHaveBeenCalledTimes(1)
    })

    it('does not fire onMenuClick on render', () => {
      const onMenuClick = jest.fn()
      renderAppBar(true, onMenuClick)
      expect(onMenuClick).not.toHaveBeenCalled()
    })

    it('fires onMenuClick once per click even if clicked twice', () => {
      const onMenuClick = jest.fn()
      renderAppBar(true, onMenuClick)
      const btn = screen.getByTestId('super-admin-menu-toggle')
      fireEvent.click(btn)
      fireEvent.click(btn)
      expect(onMenuClick).toHaveBeenCalledTimes(2)
    })
  })
})
