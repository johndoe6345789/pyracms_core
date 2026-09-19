/** useRegister: API call shape (confirmPassword stripped). */
import { act } from '@testing-library/react'
import {
  mockApi,
  MOCK_USER,
  renderRegister,
  submit,
} from '../helpers/useRegisterHelpers'

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

  it('calls POST /api/auth/register without confirmPassword', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { token: 'tok', user: MOCK_USER },
    })
    const { result } = renderRegister()
    act(() => {
      result.current.updateField('username', 'carol')
      result.current.updateField('email', 'carol@example.com')
      result.current.updateField('password', 'securepass')
      result.current.updateField('confirmPassword', 'securepass')
      result.current.updateField('firstName', 'Carol')
      result.current.updateField('lastName', 'Jones')
    })
    await submit(result)
    expect(mockApi.post).toHaveBeenCalledWith('/api/auth/register', {
      username: 'carol',
      email: 'carol@example.com',
      password: 'securepass',
      firstName: 'Carol',
      lastName: 'Jones',
    })
    const payload = mockApi.post.mock.calls[0]![1] as Record<string, unknown>
    expect(payload).not.toHaveProperty('confirmPassword')
  })
})
