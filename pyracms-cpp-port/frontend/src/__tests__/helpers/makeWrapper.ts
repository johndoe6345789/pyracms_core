import React from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '@/store/store'

/**
 * Creates a new Redux store and returns a renderHook wrapper that
 * provides it. A fresh store per test prevents state leakage.
 */
export function makeWrapper() {
  const { store } = makeStore()
  const Wrapper = ({
    children,
  }: {
    children: React.ReactNode
  }) => React.createElement(Provider, { store, children })
  return { store, Wrapper }
}
