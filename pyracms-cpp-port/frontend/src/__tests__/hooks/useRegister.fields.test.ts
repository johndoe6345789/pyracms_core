/** useRegister: updateField. */
import { act } from '@testing-library/react'
import { renderRegister } from '../helpers/useRegisterHelpers'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))

describe('useRegister', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('updateField updates the username field', () => {
    const { result } = renderRegister()
    act(() => {
      result.current.updateField('username', 'carol')
    })
    expect(result.current.formData.username).toBe('carol')
  })

  it('updateField updates the email field', () => {
    const { result } = renderRegister()
    act(() => {
      result.current.updateField('email', 'carol@example.com')
    })
    expect(result.current.formData.email).toBe('carol@example.com')
  })

  it('updateField updates the password field', () => {
    const { result } = renderRegister()
    act(() => {
      result.current.updateField('password', 'newpass1')
    })
    expect(result.current.formData.password).toBe('newpass1')
  })

  it('updateField updates confirmPassword field', () => {
    const { result } = renderRegister()
    act(() => {
      result.current.updateField('confirmPassword', 'newpass1')
    })
    expect(result.current.formData.confirmPassword).toBe('newpass1')
  })

  it('updateField updates firstName', () => {
    const { result } = renderRegister()
    act(() => {
      result.current.updateField('firstName', 'Carol')
    })
    expect(result.current.formData.firstName).toBe('Carol')
  })

  it('updateField updates lastName', () => {
    const { result } = renderRegister()
    act(() => {
      result.current.updateField('lastName', 'Jones')
    })
    expect(result.current.formData.lastName).toBe('Jones')
  })

  it('updateField does not affect other fields', () => {
    const { result } = renderRegister()
    act(() => {
      result.current.updateField('username', 'carol')
    })
    expect(result.current.formData.email).toBe('')
    expect(result.current.formData.password).toBe('')
  })
})
