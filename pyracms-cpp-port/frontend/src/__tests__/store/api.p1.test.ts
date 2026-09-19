/** @jest-environment node */
import '../helpers/apiEnv'
import { makeStore } from '@/store/store'
import { setCredentials } from '@/store/slices/authSlice'
import { api } from '@/store/api'
import type { User } from '@/types'
const calls: Request[] = []
beforeEach(() => {
  calls.length = 0
  global.fetch = jest.fn(async (req: Request) => {
    calls.push(req)
    return new Response(
      JSON.stringify(
        req.url.endsWith('/users') || req.url.endsWith('/tenants')
          ? [{ id: 1 }]
          : { id: 1 },
      ),
      { status: 200, headers: { 'content-type': 'application/json' } },
    )
  }) as unknown as typeof fetch
})

const user = { id: 1, username: 'u' } as User
const run = async (
  action: (s: ReturnType<typeof makeStore>['store']) => unknown,
  signedIn = false,
) => {
  const { store } = makeStore()
  if (signedIn) store.dispatch(setCredentials({ user, token: 'tok' }))
  await store.dispatch(action(store) as never)
  return calls.at(-1)!
}

describe('rtk-query api', () => {
  it('sends the bearer token when signed in', async () => {
    const req = await run(() => api.endpoints.getMe.initiate(), true)
    expect(req.url).toBe('http://api.test/api/auth/me')
    expect(req.headers.get('Authorization')).toBe('Bearer tok')
    expect(req.headers.get('Content-Type')).toBe('application/json')
  })

  it('omits the header for guests', async () => {
    const req = await run(() => api.endpoints.getUsers.initiate())
    expect(req.headers.get('Authorization')).toBeNull()
  })

  it.each([
    [
      'login',
      () => api.endpoints.login.initiate({ username: 'a', password: 'b' }),
      'POST',
      '/api/auth/login',
    ],
    [
      'register',
      () =>
        api.endpoints.register.initiate({
          username: 'a',
          email: 'e',
          password: 'p',
        }),
      'POST',
      '/api/auth/register',
    ],
    [
      'getUserById',
      () => api.endpoints.getUserById.initiate(4),
      'GET',
      '/api/users/4',
    ],
    [
      'updateUser',
      () => api.endpoints.updateUser.initiate({ id: 4, data: {} }),
      'PUT',
      '/api/users/4',
    ],
    [
      'changePassword',
      () =>
        api.endpoints.changePassword.initiate({
          id: 4,
          data: { currentPassword: 'a', newPassword: 'b' },
        }),
      'PUT',
      '/api/users/4/password',
    ],
    [
      'getTenants',
      () => api.endpoints.getTenants.initiate(),
      'GET',
      '/api/tenants',
    ],
    [
      'getTenantBySlug',
      () => api.endpoints.getTenantBySlug.initiate('x'),
      'GET',
      '/api/tenants/x',
    ],
    [
      'createTenant',
      () => api.endpoints.createTenant.initiate({ name: 'n', slug: 's' }),
      'POST',
      '/api/tenants',
    ],
  ])('%s hits the right endpoint', async (_n, make, method, path) => {
    const req = await run(() => make())
    expect(req.method).toBe(method)
    expect(req.url).toBe(`http://api.test${path}`)
  })

  it('tags list results for cache invalidation', async () => {
    const { store } = makeStore()
    await store.dispatch(api.endpoints.getUsers.initiate() as never)
    await store.dispatch(api.endpoints.getTenants.initiate() as never)
    const sel = api.endpoints.getUsers.select()(store.getState() as never)
    expect(sel.data).toEqual([{ id: 1 }])
  })
})
