import { screen, fireEvent, waitFor } from '@testing-library/react'
import ThemeToggle from '@/components/common/ThemeToggle'
import NotificationBell from '@/components/common/notification'
import { renderPlain } from '../../helpers/plainStore'
import { setColorMode } from '@/store/slices/uiSlice'

jest.mock('@/hooks/useWebSocket', () => ({ useWebSocket: jest.fn() }))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))

describe('menus close on Escape', () => {
  it('ThemeToggle falls back for unknown modes and closes', async () => {
    const { store } = renderPlain(<ThemeToggle />)
    store.dispatch(setColorMode('weird' as never))
    fireEvent.click(screen.getByTestId('theme-toggle'))
    expect(
      screen.getByTestId('theme-toggle').getAttribute('aria-label'),
    ).toContain('System')
    fireEvent.keyDown(screen.getByTestId('theme-menu'), { key: 'Escape' })
    await waitFor(() =>
      expect(screen.getByTestId('theme-toggle')).toHaveAttribute(
        'aria-expanded',
        'false',
      ),
    )
  })

  it('NotificationBell popover closes', async () => {
    renderPlain(<NotificationBell />)
    fireEvent.click(screen.getByTestId('notification-bell-btn'))
    fireEvent.keyDown(await screen.findByText('Notifications'), {
      key: 'Escape',
    })
    await waitFor(() => expect(screen.queryByText('Notifications')).toBeNull())
  })
})
