import { renderHook, waitFor } from '@testing-library/react'
import { useTagCloud } from '@/hooks/useTagCloud'
import { useAuthHydration } from '@/hooks/useAuthHydration'
import { renderPlain } from '../helpers/plainStore'
import api from '@/lib/api'
import { getToken } from '@/lib/session'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
jest.mock('@/lib/session', () => ({
  ...jest.requireActual('@/lib/session'),
  getToken: jest.fn(),
}))
jest.mock('next/navigation', () => ({ usePathname: () => '/' }))
const get = api.get as jest.Mock

function Probe() {
  useAuthHydration()
  return null
}

describe('hook edge cases', () => {
  it('useTagCloud treats a null payload as empty', async () => {
    get.mockResolvedValue({ data: null })
    const { result } = renderHook(() => useTagCloud(1))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.tags).toEqual([])
  })

  it('useAuthHydration ignores a failure after unmount', async () => {
    ;(getToken as jest.Mock).mockReturnValue('tok')
    let fail: (e: Error) => void = () => {}
    get.mockReturnValue(
      new Promise((_, rej) => {
        fail = rej
      }),
    )
    const { store, unmount } = renderPlain(<Probe />)
    unmount()
    fail(new Error('late'))
    await Promise.resolve()
    expect(store.getState().auth.isAuthenticated).toBe(false)
  })
})
