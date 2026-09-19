import { render, screen, fireEvent, waitFor, renderHook, act }
  from '@testing-library/react'
import ThemeToggle from '@/components/common/ThemeToggle'
import NotificationBell from '@/components/common/notification'
import PasswordStrengthBar from '@/components/auth/PasswordStrengthBar'
import { useCommentActions }
  from '@/components/common/comment/useCommentActions'
import { renderPlain } from '../../helpers/plainStore'
import { setColorMode } from '@/store/slices/uiSlice'
import api from '@/lib/api'

jest.mock('@/hooks/useWebSocket', () => ({ useWebSocket: jest.fn() }))
jest.mock('@/lib/api', () => ({
  __esModule: true, default: { post: jest.fn() },
}))

describe('menus close on Escape', () => {
  it('ThemeToggle falls back for unknown modes and closes', async () => {
    const { store } = renderPlain(<ThemeToggle />)
    store.dispatch(setColorMode('weird' as never))
    fireEvent.click(screen.getByTestId('theme-toggle'))
    expect(screen.getByTestId('theme-toggle').getAttribute('aria-label'))
      .toContain('System')
    fireEvent.keyDown(screen.getByTestId('theme-menu'), { key: 'Escape' })
    await waitFor(() => expect(screen.getByTestId('theme-toggle'))
      .toHaveAttribute('aria-expanded', 'false'))
  })

  it('NotificationBell popover closes', async () => {
    renderPlain(<NotificationBell />)
    fireEvent.click(screen.getByTestId('notification-bell-btn'))
    fireEvent.keyDown(await screen.findByText('Notifications'),
      { key: 'Escape' })
    await waitFor(() => expect(screen.queryByText('Notifications'))
      .toBeNull())
  })
})

describe('PasswordStrengthBar', () => {
  it('has no label for a zero-strength password', () => {
    render(<PasswordStrengthBar password="  " />)
    expect(screen.getByTestId('password-strength'))
      .toHaveAttribute('aria-label', 'Password strength: none')
    expect(screen.queryByTestId('password-strength-label')).toBeNull()
  })
})

describe('useCommentActions', () => {
  it('ignores guest votes and sends like/dislike', async () => {
    (api.post as jest.Mock).mockResolvedValue({})
    const onRefresh = jest.fn()
    const { result } = renderHook(() => useCommentActions(3, 'x', onRefresh))
    await act(async () => { await result.current.vote(true, false) })
    expect(api.post).not.toHaveBeenCalled()
    await act(async () => { await result.current.vote(true, true) })
    expect(api.post).toHaveBeenLastCalledWith('/api/comments/3/vote',
      { isLike: true })
    await act(async () => { await result.current.vote(false, true) })
    expect(api.post).toHaveBeenLastCalledWith('/api/comments/3/vote',
      { isLike: false })
  })
})
