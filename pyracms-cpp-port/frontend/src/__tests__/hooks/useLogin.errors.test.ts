import api from '@/lib/api'
import { asMockApi } from '../helpers/mockApi'
import {
  fillForm,
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

/** Submit a valid form and return the hook result. */
async function submitValid() {
  const { result } = renderLogin()
  fillForm(result)
  await submitForm(result)
  return result
}

describe('useLogin – error responses', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('sets error from response.data.error when token is absent',
    async () => {
      mockApi.post.mockResolvedValueOnce({
        data: { error: 'Invalid credentials' },
      })
      const result = await submitValid()
      expect(result.current.error).toBe('Invalid credentials')
    },
  )

  it('falls back when token is absent and no error msg exists',
    async () => {
      mockApi.post.mockResolvedValueOnce({ data: {} })
      const result = await submitValid()
      expect(result.current.error).toBe('Login failed')
    },
  )

  it('does not navigate when token is absent', async () => {
    mockApi.post.mockResolvedValueOnce({ data: {} })
    await submitValid()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
