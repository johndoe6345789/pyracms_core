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

describe('useLogin – axios and network errors', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('sets server error message from caught axios error',
    async () => {
      mockApi.post.mockRejectedValueOnce({
        response: { data: { error: 'Account locked' } },
      })
      const result = await submitValid()
      expect(result.current.error).toBe('Account locked')
    },
  )

  it('falls back on axios error with no message', async () => {
    mockApi.post.mockRejectedValueOnce({ response: { data: {} } })
    const result = await submitValid()
    expect(result.current.error).toBe('Login failed')
  })

  it('sets "Unable to connect to server" on a network error',
    async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Network Error'))
      const result = await submitValid()
      expect(result.current.error).toBe(
        'Unable to connect to server',
      )
    },
  )

  it('sets "Unable to connect to server" when error is a string',
    async () => {
      mockApi.post.mockRejectedValueOnce('timeout')
      const result = await submitValid()
      expect(result.current.error).toBe(
        'Unable to connect to server',
      )
    },
  )
})
