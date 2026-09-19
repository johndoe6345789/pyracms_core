import { renderHook, waitFor } from '@testing-library/react'
import { useOAuthCallback } from '@/hooks/useOAuthCallback'
import { stashOAuth } from '@/lib/oauth'
import api from '@/lib/api'

const replace = jest.fn()
const dispatch = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }))
jest.mock('react-redux', () => ({ useDispatch: () => dispatch }))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))
const post = api.post as jest.Mock

describe('useOAuthCallback', () => {
  beforeEach(() => {
    ;[post, replace, dispatch].forEach((f) => f.mockReset())
    sessionStorage.clear()
    localStorage.clear()
  })

  it('exchanges the code, stores the session and redirects', async () => {
    stashOAuth('github', '/site/x')
    post.mockResolvedValue({ data: { token: 'T', user: { id: 1 } } })
    renderHook(() => useOAuthCallback('c', 's'))
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/site/x'))
    expect(post).toHaveBeenCalledWith('/api/auth/oauth/github/callback', {
      code: 'c',
      state: 's',
    })
    expect(localStorage.getItem('token')).toBe('T')
    expect(dispatch).toHaveBeenCalled()
  })
  it('reports server errors', async () => {
    stashOAuth('github')
    post.mockRejectedValue({ response: { data: { error: 'expired' } } })
    const { result } = renderHook(() => useOAuthCallback('c', 's'))
    await waitFor(() => expect(result.current.error).toBe('expired'))
    expect(replace).not.toHaveBeenCalled()
  })
  it('fails without code/state or a pending provider', async () => {
    const a = renderHook(() => useOAuthCallback('', ''))
    await waitFor(() => expect(a.result.current.error).toBeTruthy())
    const b = renderHook(() => useOAuthCallback('c', 's'))
    await waitFor(() => expect(b.result.current.error).toBeTruthy())
    expect(post).not.toHaveBeenCalled()
  })
})
