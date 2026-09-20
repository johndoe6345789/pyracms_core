import { render, screen } from '@testing-library/react'
import { renderWithStore } from '../../helpers/renderWithStore'
import RegisterPage from '@/app/auth/register/page'
import PlatformSignupNotice from '@/components/auth/PlatformSignupNotice'

let query = ''
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(query),
}))
jest.mock('@/lib/api', () => ({ __esModule: true, default: {} }))

describe('portal sign-up', () => {
  it('explains that accounts belong to a site', () => {
    render(<PlatformSignupNotice />)
    expect(screen.getByText(/Sign up on a site/)).toBeInTheDocument()
    expect(screen.getByText('Create a site').closest('a')).toHaveAttribute(
      'href',
      '/create-site',
    )
  })

  it('is what the register page shows without a site', () => {
    query = ''
    const { unmount } = render(<RegisterPage />)
    expect(screen.getByTestId('platform-signup-notice')).toBeInTheDocument()
    expect(screen.queryByTestId('register-form')).toBeNull()
    unmount()
  })

  it('shows the register form for a site', () => {
    query = 'tenant=alpha'
    renderWithStore(<RegisterPage />)
    expect(screen.getByTestId('register-form')).toBeInTheDocument()
  })
})
