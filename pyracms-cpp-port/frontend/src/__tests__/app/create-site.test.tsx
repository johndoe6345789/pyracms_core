/**
 * Tests for the create-site page.
 *
 * Uses a lightweight Redux store (no persist) to set
 * isAuthenticated true / false and verifies which child
 * component is rendered.
 */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/store/slices/authSlice'
import CreateSitePage from '@/app/create-site/page'

// ── Module mocks ──────────────────────────────────────────────

jest.mock('next/link', () => {
  const MockLink = ({
    href,
    children,
    ...rest
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

jest.mock(
  '@/components/create-site/AuthPromptCard',
  () => {
    const MockAuthPromptCard = () => (
      <div data-testid="mock-auth-prompt-card" />
    )
    MockAuthPromptCard.displayName = 'MockAuthPromptCard'
    return MockAuthPromptCard
  },
)

jest.mock(
  '@/components/create-site/CreateSiteForm',
  () => {
    const MockCreateSiteForm = () => (
      <div data-testid="mock-create-site-form" />
    )
    MockCreateSiteForm.displayName = 'MockCreateSiteForm'
    return MockCreateSiteForm
  },
)

// ── Store helpers ─────────────────────────────────────────────

/** Build a minimal test store with the auth slice only. */
function makeTestStore(isAuthenticated: boolean) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        isAuthenticated,
        user: null,
        token: null,
      },
    },
  })
}

/** Render CreateSitePage wrapped in a test store. */
function renderPage(isAuthenticated: boolean) {
  const store = makeTestStore(isAuthenticated)
  return render(
    <Provider store={store}>
      <CreateSitePage />
    </Provider>,
  )
}

// ── Tests ─────────────────────────────────────────────────────

describe('CreateSitePage', () => {
  // ── Unauthenticated ───────────────────────────────────────

  it('shows AuthPromptCard when not authenticated', () => {
    renderPage(false)
    expect(
      screen.getByTestId('mock-auth-prompt-card'),
    ).toBeInTheDocument()
  })

  it('does not show CreateSiteForm when not authenticated', () => {
    renderPage(false)
    expect(
      screen.queryByTestId('mock-create-site-form'),
    ).not.toBeInTheDocument()
  })

  // ── Authenticated ─────────────────────────────────────────

  it('shows CreateSiteForm when authenticated', () => {
    renderPage(true)
    expect(
      screen.getByTestId('mock-create-site-form'),
    ).toBeInTheDocument()
  })

  it('does not show AuthPromptCard when authenticated', () => {
    renderPage(true)
    expect(
      screen.queryByTestId('mock-auth-prompt-card'),
    ).not.toBeInTheDocument()
  })

  // ── Page structure ────────────────────────────────────────

  it('renders data-testid="create-site-page"', () => {
    renderPage(false)
    expect(
      screen.getByTestId('create-site-page'),
    ).toBeInTheDocument()
  })

  it('root element has role="main"', () => {
    renderPage(false)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('root element has aria-label "Create new site"', () => {
    renderPage(false)
    expect(
      screen.getByRole('main', {
        name: /create new site/i,
      }),
    ).toBeInTheDocument()
  })

  // ── Page title ────────────────────────────────────────────

  it('sets document.title to "Create New Site – PyraCMS"', () => {
    renderPage(false)
    expect(document.title).toBe(
      'Create New Site – PyraCMS',
    )
  })

  // ── Back to Portal link ───────────────────────────────────

  it('renders "Back to Portal" link', () => {
    renderPage(false)
    expect(
      screen.getByTestId('back-to-portal-link'),
    ).toBeInTheDocument()
  })

  it('"Back to Portal" link points to /portal', () => {
    renderPage(false)
    expect(
      screen.getByTestId('back-to-portal-link'),
    ).toHaveAttribute('href', '/portal')
  })

  it('"Back to Portal" link has descriptive aria-label', () => {
    renderPage(false)
    expect(
      screen.getByTestId('back-to-portal-link'),
    ).toHaveAttribute('aria-label', 'Back to Portal')
  })

  // ── Page heading ──────────────────────────────────────────

  it('renders h1 heading "New Site"', () => {
    renderPage(false)
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /new site/i,
      }),
    ).toBeInTheDocument()
  })
})
