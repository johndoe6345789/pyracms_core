import { render, screen } from '@testing-library/react'
import Page from '@/app/auth/oauth/callback/page'

let query = 'code=c&state=s'
const mockHook = jest.fn()
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(query),
}))
jest.mock('@/hooks/useOAuthCallback', () => ({
  useOAuthCallback: (c: string, s: string) => mockHook(c, s),
}))

describe('OAuth callback page', () => {
  it('shows progress while exchanging', () => {
    mockHook.mockReturnValue({ error: '' })
    render(<Page />)
    expect(mockHook).toHaveBeenCalledWith('c', 's')
    expect(screen.getByTestId('oauth-pending')).toBeInTheDocument()
  })
  it('shows the failure with a way back', () => {
    query = ''
    mockHook.mockReturnValue({ error: 'bad state' })
    render(<Page />)
    expect(screen.getByTestId('oauth-callback-error'))
      .toHaveTextContent('bad state')
    expect(screen.getByText('Back to sign in'))
      .toHaveAttribute('href', '/auth/login')
  })
})
