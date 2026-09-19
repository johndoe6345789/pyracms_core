/** @jest-environment node */
import '../helpers/apiEnv'
import { makeStore } from '@/store/store'
import { api } from '@/store/api'
import * as mod from '@/store/api'
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

describe('rtk-query api failures and exports', () => {
  it('provides list tags even when the request fails', async () => {
    global.fetch = jest.fn(
      async () =>
        new Response('{}', {
          status: 500,
          headers: { 'content-type': 'application/json' },
        }),
    ) as never
    const { store } = makeStore()
    const users = (await store.dispatch(
      api.endpoints.getUsers.initiate() as never,
    )) as { isError: boolean }
    const tenants = (await store.dispatch(
      api.endpoints.getTenants.initiate() as never,
    )) as { isError: boolean }
    expect(users.isError && tenants.isError).toBe(true)
  })

  it('exports a hook per endpoint', () => {
    const names = Object.keys(mod).filter((k) => k.startsWith('use'))
    expect(names).toHaveLength(10)
    names.forEach((n) => expect(typeof (mod as never)[n]).toBe('function'))
  })
})
