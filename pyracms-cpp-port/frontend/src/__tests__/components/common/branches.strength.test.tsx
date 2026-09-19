import { render, screen, renderHook, act } from '@testing-library/react'
import PasswordStrengthBar from '@/components/auth/PasswordStrengthBar'
import { useCommentActions } from '../../helpers/imports/commentActions'
import api from '@/lib/api'

jest.mock('@/hooks/useWebSocket', () => ({ useWebSocket: jest.fn() }))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))

describe('PasswordStrengthBar', () => {
  it('has no label for a zero-strength password', () => {
    render(<PasswordStrengthBar password="  " />)
    expect(screen.getByTestId('password-strength')).toHaveAttribute(
      'aria-label',
      'Password strength: none',
    )
    expect(screen.queryByTestId('password-strength-label')).toBeNull()
  })
})

describe('useCommentActions', () => {
  it('ignores guest votes and sends like/dislike', async () => {
    ;(api.post as jest.Mock).mockResolvedValue({})
    const onRefresh = jest.fn()
    const { result } = renderHook(() => useCommentActions(3, 'x', onRefresh))
    await act(async () => {
      await result.current.vote(true, false)
    })
    expect(api.post).not.toHaveBeenCalled()
    await act(async () => {
      await result.current.vote(true, true)
    })
    expect(api.post).toHaveBeenLastCalledWith('/api/comments/3/vote', {
      isLike: true,
    })
    await act(async () => {
      await result.current.vote(false, true)
    })
    expect(api.post).toHaveBeenLastCalledWith('/api/comments/3/vote', {
      isLike: false,
    })
  })
})
