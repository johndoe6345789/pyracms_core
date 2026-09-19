import { screen, fireEvent, waitFor } from '@testing-library/react'
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
  it('asks guests to sign in', () => {
    mount(false)
    expect(screen.getByTestId('account-signin')).toBeInTheDocument()
  })
  it('loads and saves the profile', async () => {
    m.get.mockResolvedValue({ data: { fullName: 'Al', email: 'a@b.co' } })
    m.put.mockResolvedValue({ data: {} })
    mount()
    await waitFor(() =>
      expect(screen.getByTestId('profile-fullName')).toHaveValue('Al'),
    )
    type('profile-website', 'https://x.io')
    fireEvent.submit(screen.getByTestId('profile-form'))
    expect(await screen.findByTestId('profile-done')).toBeInTheDocument()
    expect(m.put).toHaveBeenCalledWith(
      '/api/users/4',
      expect.objectContaining({
        fullName: 'Al',
        website: 'https://x.io',
      }),
    )
  })
  it('shows profile load and save errors', async () => {
    m.get.mockRejectedValue(new Error('x'))
    m.put.mockRejectedValue({ response: { data: { error: 'Bad email' } } })
    mount()
    expect(await screen.findByTestId('profile-error')).toHaveTextContent('load')
    fireEvent.submit(screen.getByTestId('profile-form'))
    await waitFor(() =>
      expect(screen.getByTestId('profile-error')).toHaveTextContent(
        'Bad email',
      ),
    )
  })
})
