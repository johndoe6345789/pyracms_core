import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '@/store/store'

/** Fresh store + renderHook wrapper (no state leakage between tests). */
export function makeWrapper() {
  const { store } = makeStore()
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  return { store, Wrapper }
}
