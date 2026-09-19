import { render, screen } from '@testing-library/react'
import { makeStore, getStoreInstance } from '@/store/store'
import StoreProvider from '@/store/StoreProvider'
import auth, { setCredentials, setUser, logout } from '@/store/slices/authSlice'
import ui, {
  setColorMode,
  addFlashMessage,
  removeFlashMessage,
  toggleSidebar,
  setNotificationBellOpen,
} from '@/store/slices/uiSlice'
import type { User } from '@/types'

const user = { id: 1, username: 'u' } as User

describe('authSlice', () => {
  it('signs in, updates and signs out', () => {
    let s = auth(undefined, setCredentials({ user, token: 't' }))
    expect(s).toMatchObject({ isAuthenticated: true, token: 't' })
    s = auth(s, setUser({ ...user, username: 'v' }))
    expect(s.user!.username).toBe('v')
    s = auth(s, logout())
    expect(s).toEqual({ user: null, token: null, isAuthenticated: false })
  })
})

describe('uiSlice', () => {
  it('handles mode, sidebar and bell', () => {
    let s = ui(undefined, setColorMode('dark'))
    s = ui(s, toggleSidebar())
    s = ui(s, setNotificationBellOpen(true))
    expect(s).toMatchObject({
      colorMode: 'dark',
      sidebarCollapsed: true,
      notificationBellOpen: true,
    })
  })

  it('adds and removes flash messages', () => {
    Object.defineProperty(globalThis.crypto, 'randomUUID', {
      value: () => 'abc-abc-abc-abc-abc',
      configurable: true,
    })
    let s = ui(undefined, addFlashMessage({ message: 'hi', severity: 'info' }))
    expect(s.flashMessages[0]).toMatchObject({ id: 'abc-abc-abc-abc-abc' })
    s = ui(s, removeFlashMessage('abc-abc-abc-abc-abc'))
    expect(s.flashMessages).toEqual([])
  })
})

describe('store', () => {
  it('builds isolated stores and one shared instance', () => {
    expect(makeStore().store).not.toBe(makeStore().store)
    expect(getStoreInstance()).toBe(getStoreInstance())
  })

  it('StoreProvider renders children once rehydrated', async () => {
    render(
      <StoreProvider>
        <p>inside</p>
      </StoreProvider>,
    )
    expect(await screen.findByText('inside')).toBeInTheDocument()
  })
})
