import { render, screen, fireEvent } from '@testing-library/react'
import api from '@/lib/api'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { asMockApi } from '../../helpers/mockApi'
import { type } from '../../helpers/authType'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))
const m = asMockApi<'post'>(api)
beforeEach(() => m.post.mockReset())

describe('ResetPasswordForm tenant', () => {
  it('links to the site login after success', async () => {
    m.post.mockResolvedValue({})
    render(<ResetPasswordForm token="t" tenant="acme" />)
    type('reset-password', 'longenough1')
    type('reset-confirm', 'longenough1')
    fireEvent.submit(screen.getByTestId('reset-form'))
    expect(await screen.findByTestId('reset-login-link'))
      .toHaveAttribute('href', '/auth/login?tenant=acme')
  })
})
