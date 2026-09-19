/** @jest-environment node */
import { makeStore } from '@/store/store'
import { setColorMode } from '@/store/slices/uiSlice'

describe('store without a window (SSR)', () => {
  it('persists through the no-op storage and purges', async () => {
    const { store, persistor } = makeStore()
    store.dispatch(setColorMode('dark'))
    await new Promise((r) => setTimeout(r, 80))
    await persistor.purge()
    expect(store.getState().ui.colorMode).toBe('dark')
  })
})
