import { screen, fireEvent } from '@testing-library/react'
import api from '@/lib/api'
import { asMockApi } from '../helpers/mockApi'
import { mount } from '../helpers/accountMount'
import { type } from '../helpers/authType'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn() },
}))
const replaceToken = jest.fn()
jest.mock('@/lib/session', () => ({
  replaceToken: (...a: unknown[]) => replaceToken(...a),
  scopeFromPath: () => null,
}))
const m = asMockApi<'get' | 'put'>(api)
beforeEach(() => {
  m.get.mockReset()
  m.put.mockReset()
  replaceToken.mockReset()
})

describe('AccountSettings', () => {
  it('changes the password and adopts the fresh token', async () => {
    m.get.mockResolvedValue({ data: {} })
    m.put.mockResolvedValue({ data: { success: true, token: 'fresh' } })
    const store = mount()
    const submit = () => fireEvent.submit(screen.getByTestId('password-form'))
    submit()
    expect(screen.getByTestId('password-error')).toHaveTextContent('Current')
    type('pw-current', 'old-pass')
    type('pw-new', 'newpass123')
    type('pw-confirm', 'nope')
    submit()
    expect(screen.getByTestId('password-error')).toHaveTextContent('match')
    type('pw-confirm', 'newpass123')
    submit()
    expect(await screen.findByTestId('password-done')).toBeInTheDocument()
    expect(m.put).toHaveBeenCalledWith('/api/users/4/password',
      { currentPassword: 'old-pass', newPassword: 'newpass123' })
    expect(replaceToken).toHaveBeenCalledWith(null, 'fresh')
    expect(store.getState().auth.token).toBe('fresh')
  })
  it('shows a wrong-current-password error', async () => {
    m.get.mockResolvedValue({ data: {} })
    m.put.mockRejectedValue({
      response: { data: { error: 'Current password is incorrect' } },
    })
    mount()
    type('pw-current', 'bad')
    type('pw-new', 'newpass123')
    type('pw-confirm', 'newpass123')
    fireEvent.submit(screen.getByTestId('password-form'))
    expect(await screen.findByTestId('password-error'))
      .toHaveTextContent('incorrect')
  })
})
