/** @jest-environment node */
import '../helpers/apiEnv'
import { makeStore } from '@/store/store'
import { api } from '@/store/api'
import { installFetch } from '../helpers/storeApiRun'

beforeEach(installFetch)

describe('rtk-query api', () => {
  it('tags list results for cache invalidation', async () => {
    const { store } = makeStore()
    await store.dispatch(api.endpoints.getUsers.initiate() as never)
    await store.dispatch(api.endpoints.getTenants.initiate() as never)
    const sel = api.endpoints.getUsers.select()(store.getState() as never)
    expect(sel.data).toEqual([{ id: 1 }])
  })
})
