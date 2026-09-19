import { makeStore } from '@/store/store'
import { setCredentials } from '@/store/slices/authSlice'
import type { User } from '@/types'

const calls: Request[] = []

/** Replace fetch with a recorder that answers with JSON. */
export const installFetch = () => {
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
}

const user = { id: 1, username: 'u' } as User

export const run = async (
  action: (s: ReturnType<typeof makeStore>['store']) => unknown,
  signedIn = false,
) => {
  const { store } = makeStore()
  if (signedIn) store.dispatch(setCredentials({ user, token: 'tok' }))
  await store.dispatch(action(store) as never)
  return calls.at(-1)!
}
