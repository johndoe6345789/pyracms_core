import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderAppBar }
  from '@/__tests__/helpers/superAdminAppBarHelpers'

jest.mock('next/navigation', () =>
  require('@/__tests__/helpers/superAdminAppBarHelpers')
    .navigationMock)

describe('SuperAdminAppBar', () => {
  describe('title', () => {
    it('renders "PyraCMS Super Admin"', () => {
      renderAppBar(false, jest.fn())
      expect(
        screen.getByText('PyraCMS Super Admin'),
      ).toBeInTheDocument()
    })
  })

  describe('toolbar', () => {
    it('has data-testid="super-admin-toolbar"', () => {
      renderAppBar(false, jest.fn())
      expect(
        screen.getByTestId('super-admin-toolbar'),
      ).toBeInTheDocument()
    })
  })

  describe('shield icon', () => {
    it('renders the ShieldOutlined icon with aria-hidden', () => {
      const { container } = renderAppBar(false, jest.fn())
      const hiddenIcon = container.querySelector(
        '[aria-hidden="true"]',
      )
      expect(hiddenIcon).toBeInTheDocument()
    })
  })

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

  describe('child controls', () => {
    it('renders the ThemeToggle button', () => {
      renderAppBar(false, jest.fn())
      expect(
        screen.getByTestId('theme-toggle'),
      ).toBeInTheDocument()
    })

    it('renders the UserBubble (guest chip or user button)', () => {
      renderAppBar(false, jest.fn())
      expect(
        screen.getByTestId('guest-login-link'),
      ).toBeInTheDocument()
    })
  })
})
