import { act } from '@testing-library/react'
import api from '@/lib/api'
import { asMockApi } from '../helpers/mockApi'
import {
  renderLogin,
  submitForm,
} from '../helpers/loginHookHelpers'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))

const mockApi = asMockApi<'post'>(api)

describe('useLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('updateField updates the username field', () => {
    const { result } = renderLogin()
    act(() => {
      result.current.updateField('username', 'alice')
    })
    expect(result.current.formData.username).toBe('alice')
  })

  it('updateField updates the password field', () => {
    const { result } = renderLogin()
    act(() => {
      result.current.updateField('password', 'hunter2')
    })
    expect(result.current.formData.password).toBe('hunter2')
  })

  it('updateField does not affect other fields', () => {
    const { result } = renderLogin()
    act(() => {
      result.current.updateField('username', 'bob')
    })
    expect(result.current.formData.password).toBe('')
  })

  it('sets error and does not call API when username is empty',
    async () => {
      const { result } = renderLogin()
      await submitForm(result)
      expect(result.current.error).toBe('Username is required')
      expect(mockApi.post).not.toHaveBeenCalled()
    },
  )

  it('sets error and does not call API when password is empty',
    async () => {
      const { result } = renderLogin()
      act(() => {
        result.current.updateField('username', 'alice')
      })
      await submitForm(result)
      expect(result.current.error).toBe('Password is required')
      expect(mockApi.post).not.toHaveBeenCalled()
    },
  )

  it('loading stays false after a validation failure', async () => {
    const { result } = renderLogin()
    await submitForm(result)
    expect(result.current.loading).toBe(false)
  })
})
