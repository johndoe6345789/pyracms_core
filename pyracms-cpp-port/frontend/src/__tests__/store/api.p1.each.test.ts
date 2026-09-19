/** @jest-environment node */
import '../helpers/apiEnv'
import { api } from '@/store/api'
import { installFetch, run } from '../helpers/storeApiRun'

beforeEach(installFetch)

describe('rtk-query api', () => {
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
})
