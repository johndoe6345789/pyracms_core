import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import api from '@/lib/api'
import authReducer from '@/store/slices/authSlice'
import AccountSettings from '@/components/users/AccountSettings'
import { asMockApi } from '../helpers/mockApi'

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

const user = { id: 4, username: 'u' }
function mount(signedIn = true) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: signedIn
        ? { user: user as never, token: 'old', isAuthenticated: true }
        : { user: null, token: null, isAuthenticated: false },
    },
  })
  render(<Provider store={store}><AccountSettings loginHref="/l" /></Provider>)
  return store
}
const type = (id: string, v: string) =>
  fireEvent.change(screen.getByTestId(id), { target: { value: v } })

describe('AccountSettings', () => {
  it('asks guests to sign in', () => {
    mount(false)
    expect(screen.getByTestId('account-signin')).toBeInTheDocument()
  })
  it('loads and saves the profile', async () => {
    m.get.mockResolvedValue({ data: { fullName: 'Al', email: 'a@b.co' } })
    m.put.mockResolvedValue({ data: {} })
    mount()
    await waitFor(() =>
      expect(screen.getByTestId('profile-fullName')).toHaveValue('Al'))
    type('profile-website', 'https://x.io')
    fireEvent.submit(screen.getByTestId('profile-form'))
    expect(await screen.findByTestId('profile-done')).toBeInTheDocument()
    expect(m.put).toHaveBeenCalledWith('/api/users/4', expect.objectContaining({
      fullName: 'Al', website: 'https://x.io',
    }))
  })
  it('shows profile load and save errors', async () => {
    m.get.mockRejectedValue(new Error('x'))
    m.put.mockRejectedValue({ response: { data: { error: 'Bad email' } } })
    mount()
    expect(await screen.findByTestId('profile-error'))
      .toHaveTextContent('load')
    fireEvent.submit(screen.getByTestId('profile-form'))
    await waitFor(() => expect(screen.getByTestId('profile-error'))
      .toHaveTextContent('Bad email'))
  })
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
