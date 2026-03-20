import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AuthPageShell from '@/components/auth/AuthPageShell'

/**
 * Tests for AuthPageShell.
 *
 * Covers: children rendering, role="main" landmark,
 * and gradient background style.
 */
describe('AuthPageShell', () => {
  it('renders children inside the shell', () => {
    render(
      <AuthPageShell>
        <p data-testid="child-content">Hello world</p>
      </AuthPageShell>,
    )
    expect(
      screen.getByTestId('child-content'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('child-content'),
    ).toHaveTextContent('Hello world')
  })

  it('has role="main" landmark', () => {
    render(
      <AuthPageShell>
        <span>content</span>
      </AuthPageShell>,
    )
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('applies gradient background to the outer box', () => {
    render(
      <AuthPageShell>
        <span>content</span>
      </AuthPageShell>,
    )
    // MUI/Emotion injects styles via CSSStyleSheet.insertRule
    // so textContent of <style> tags is empty. Read the rules
    // directly from the CSSOM instead.
    const allRules = Array.from(document.styleSheets)
      .flatMap((sheet) => {
        try {
          return Array.from(sheet.cssRules).map(
            (r) => r.cssText,
          )
        } catch {
          return []
        }
      })
      .join('\n')
    expect(allRules).toMatch(/linear-gradient/)
  })

  it('renders multiple children', () => {
    render(
      <AuthPageShell>
        <p data-testid="first">First</p>
        <p data-testid="second">Second</p>
      </AuthPageShell>,
    )
    expect(screen.getByTestId('first')).toBeInTheDocument()
    expect(screen.getByTestId('second')).toBeInTheDocument()
  })
})
