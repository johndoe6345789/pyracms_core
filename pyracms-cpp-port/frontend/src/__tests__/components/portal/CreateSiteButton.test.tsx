import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import CreateSiteButton
  from '@/components/portal/CreateSiteButton'
import authReducer, {
  setCredentials,
} from '@/store/slices/authSlice'
import type { User } from '@/types'

// --------------- helpers ---------------

/**
 * Build a minimal store containing only the auth slice.
 * We avoid makeStore() to sidestep redux-persist / localStorage
 * in jsdom.
 */
function makeAuthStore(isAuthenticated = false) {
  const store = configureStore({
    reducer: { auth: authReducer },
  })

  if (isAuthenticated) {
    const fakeUser: User = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      isActive: true,
      isAdmin: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }
    store.dispatch(
      setCredentials({ user: fakeUser, token: 'tok' }),
    )
  }

  return store
}

function renderButton(isAuthenticated = false) {
  const store = makeAuthStore(isAuthenticated)
  render(
    <Provider store={store}>
      <CreateSiteButton />
    </Provider>,
  )
}

// --------------- tests ---------------

describe('CreateSiteButton', () => {
  describe('when the user is NOT authenticated', () => {
    beforeEach(() => renderButton(false))

    it('renders a button/link with data-testid', () => {
      expect(
        screen.getByTestId('create-site-button'),
      ).toBeInTheDocument()
    })

    it('links to /auth/login/create-site', () => {
      const btn = screen.getByTestId('create-site-button')
      expect(btn.closest('a')).toHaveAttribute(
        'href',
        '/auth/login/create-site',
      )
    })

    it(
      'has aria-label "Sign in to create a new site"',
      () => {
        expect(
          screen.getByTestId('create-site-button'),
        ).toHaveAttribute(
          'aria-label',
          'Sign in to create a new site',
        )
      },
    )

    it('displays "Create New Site" button text', () => {
      expect(
        screen.getByTestId('create-site-button'),
      ).toHaveTextContent('Create New Site')
    })
  })

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
