import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderAppBar }
  from '@/__tests__/helpers/superAdminAppBarHelpers'

jest.mock('next/navigation', () =>
  require('@/__tests__/helpers/superAdminAppBarHelpers')
    .navigationMock)

describe('SuperAdminAppBar', () => {
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

    it('fires onMenuClick once per click even if clicked twice',
      () => {
        const onMenuClick = jest.fn()
        renderAppBar(true, onMenuClick)
        const btn = screen.getByTestId('super-admin-menu-toggle')
        fireEvent.click(btn)
        fireEvent.click(btn)
        expect(onMenuClick).toHaveBeenCalledTimes(2)
      },
    )
  })
})
