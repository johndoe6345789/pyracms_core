/**
 * Tests for SuperAdminAppBar.
 *
 * SuperAdminAppBar contains:
 *   - A sticky AppBar with data-testid="super-admin-toolbar"
 *   - "PyraCMS Super Admin" title
 *   - ShieldOutlined icon (aria-hidden)
 *   - A menu-toggle IconButton shown only when isMobile=true
 *   - ThemeToggle and UserBubble (Redux-connected child components)
 *
 * ThemeToggle and UserBubble both require a Redux store, so tests
 * wrap the component in a minimal Provider + createStore.
 *
 * Coverage:
 *   1. "PyraCMS Super Admin" title rendered
 *   2. data-testid="super-admin-toolbar" present
 *   3. Menu toggle visible when isMobile=true
 *   4. Menu toggle hidden when isMobile=false
 *   5. Menu toggle calls onMenuClick
 *   6. Menu toggle has correct aria-label
 *   7. ShieldOutlined icon is aria-hidden
 *   8. ThemeToggle / UserBubble subtree rendered
 */

import {
  render, screen, fireEvent,
} from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/store/slices/authSlice'
import uiReducer from '@/store/slices/uiSlice'
import SuperAdminAppBar
  from '@/components/super-admin/SuperAdminAppBar'

// ---------------------------------------------------------------------------
// Mock next/navigation
// ---------------------------------------------------------------------------

// UserBubble (rendered inside AppBar) calls useRouter and useParams,
// which require the Next.js app router context.  In unit tests we
// replace them with lightweight stubs.
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useParams: () => ({ slug: 'demo' }),
  usePathname: () => '/super-admin',
}))

// ---------------------------------------------------------------------------
// Test store
// ---------------------------------------------------------------------------

/**
 * Builds a lightweight Redux store containing only the slices
 * needed by ThemeToggle and UserBubble.
 */
function makeTestStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
    },
  })
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Render inside a Redux Provider with a fresh test store. */
function renderAppBar(isMobile: boolean, onMenuClick: jest.Mock) {
  const store = makeTestStore()
  return render(
    <Provider store={store}>
      <SuperAdminAppBar
        isMobile={isMobile}
        onMenuClick={onMenuClick}
      />
    </Provider>,
  )
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('SuperAdminAppBar', () => {
  // -------------------------------------------------------------------------
  // Title
  // -------------------------------------------------------------------------

  describe('title', () => {
    it('renders "PyraCMS Super Admin"', () => {
      renderAppBar(false, jest.fn())
      expect(
        screen.getByText('PyraCMS Super Admin'),
      ).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Toolbar testid
  // -------------------------------------------------------------------------

  describe('toolbar', () => {
    it('has data-testid="super-admin-toolbar"', () => {
      renderAppBar(false, jest.fn())
      expect(
        screen.getByTestId('super-admin-toolbar'),
      ).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Shield icon
  // -------------------------------------------------------------------------

  describe('shield icon', () => {
    it('renders the ShieldOutlined icon with aria-hidden', () => {
      const { container } = renderAppBar(false, jest.fn())
      // The aria-hidden wrapper <svg> or parent element.
      const hiddenIcon = container.querySelector(
        '[aria-hidden="true"]',
      )
      expect(hiddenIcon).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Menu toggle – desktop (isMobile=false)
  // -------------------------------------------------------------------------

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

  // -------------------------------------------------------------------------
  // Menu toggle – mobile (isMobile=true)
  // -------------------------------------------------------------------------

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

  // -------------------------------------------------------------------------
  // Child controls (ThemeToggle / UserBubble)
  // -------------------------------------------------------------------------

  describe('child controls', () => {
    it('renders the ThemeToggle button', () => {
      renderAppBar(false, jest.fn())
      expect(
        screen.getByTestId('theme-toggle'),
      ).toBeInTheDocument()
    })

    it('renders the UserBubble (guest chip or user button)', () => {
      renderAppBar(false, jest.fn())
      // In the default unauthenticated state UserBubble renders
      // the guest-login-link chip.
      expect(
        screen.getByTestId('guest-login-link'),
      ).toBeInTheDocument()
    })
  })
})
