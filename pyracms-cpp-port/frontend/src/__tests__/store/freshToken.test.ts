import { adoptFreshToken } from '@/store/endpoints/freshToken'
import { getToken } from '@/lib/session'
import type { User } from '@/types'

const user = { id: 1, username: 'u' } as User

beforeEach(() => {
  localStorage.clear()
  window.history.pushState({}, '', '/site/demo/settings')
})

it('stores the token for the current site and updates redux', () => {
  localStorage.setItem('token:demo', 'old')
  const dispatch = jest.fn()
  adoptFreshToken({ success: true, token: 'new' }, user, dispatch)
  expect(getToken('demo')).toBe('new')
  expect(dispatch).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'auth/setCredentials',
      payload: { user, token: 'new' },
    }),
  )
})

it('uses the platform slot on portal pages', () => {
  window.history.pushState({}, '', '/profile')
  localStorage.setItem('token', 'old')
  adoptFreshToken({ success: true, token: 'new' }, user, jest.fn())
  expect(localStorage.getItem('token')).toBe('new')
})

it('does nothing without a token in the reply', () => {
  const dispatch = jest.fn()
  adoptFreshToken({ success: true }, user, dispatch)
  adoptFreshToken(undefined, user, dispatch)
  expect(dispatch).not.toHaveBeenCalled()
})

it('keeps the token even if nobody is signed in in redux', () => {
  const dispatch = jest.fn()
  adoptFreshToken({ success: true, token: 'n' }, null, dispatch)
  expect(getToken('demo')).toBe('n')
  expect(dispatch).not.toHaveBeenCalled()
})
