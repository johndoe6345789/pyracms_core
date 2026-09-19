/** RegisterFields: password strength indicator. */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { setup } from '../../helpers/registerFieldsSetup'

describe('RegisterFields – password strength indicator', () => {
  it('does not show strength bar when password is empty', () => {
    setup({ password: '' })
    expect(screen.queryByTestId('password-strength')).not.toBeInTheDocument()
  })

  it('shows strength bar when password has content', () => {
    setup({ password: 'abc' })
    expect(screen.getByTestId('password-strength')).toBeInTheDocument()
  })

  it('strength bar has role="status" and aria-live="polite"', () => {
    setup({ password: 'abc' })
    const bar = screen.getByTestId('password-strength')
    expect(bar).toHaveAttribute('role', 'status')
    expect(bar).toHaveAttribute('aria-live', 'polite')
  })

  it('shows "Weak" label for a short password', () => {
    setup({ password: 'abc' })
    expect(screen.getByTestId('password-strength-label')).toHaveTextContent(
      'Weak',
    )
  })

  it('shows "Strong" label for a fully complex password', () => {
    setup({ password: 'Abcdef1!' })
    expect(screen.getByTestId('password-strength-label')).toHaveTextContent(
      'Strong',
    )
  })

  it('aria-label contains strength text', () => {
    setup({ password: 'Abcdef1!' })
    expect(screen.getByTestId('password-strength')).toHaveAttribute(
      'aria-label',
      'Password strength: Strong',
    )
  })
})
