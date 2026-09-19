import { renderHook, act } from '@testing-library/react'
import { useTurboLogin } from '@/hooks/useTurboLogin'
import { parseTurbologin } from '@/lib/turbologin'
import { apiErrorMessage } from '@/lib/apiError'

const push = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

const clip = (read: () => Promise<string>) =>
  Object.assign(navigator, { clipboard: { readText: read } })

describe('parseTurbologin', () => {
  it('validates clipboard content', () => {
    expect(parseTurbologin(' ').ok).toBe(false)
    expect(parseTurbologin('{bad').ok).toBe(false)
    expect(parseTurbologin('{"user":"a"}').ok).toBe(false)
    expect(parseTurbologin('{"user":"a","pass":"b"}')).toEqual({
      ok: true,
      user: 'a',
      pass: 'b',
    })
  })
})

describe('apiErrorMessage', () => {
  it('picks the best message', () => {
    expect(apiErrorMessage({ response: { data: { error: 'no' } } }, 'f')).toBe(
      'no',
    )
    expect(apiErrorMessage({ response: {} }, 'f')).toBe('f')
    expect(apiErrorMessage(new Error('x'), 'f')).toBe(
      'Unable to connect to server',
    )
  })
})

describe('useTurboLogin', () => {
  beforeEach(() => push.mockClear())

  it('logs in and redirects', async () => {
    clip(async () => '{"user":"a","pass":"b"}')
    const login = jest.fn().mockResolvedValue(true)
    const { result } = renderHook(() => useTurboLogin(login, '/x'))
    await act(() => result.current.handleTurboLogin())
    expect(login).toHaveBeenCalledWith('a', 'b')
    expect(push).toHaveBeenCalledWith('/x')
  })

  it('defaults the redirect and skips it on failure', async () => {
    clip(async () => '{"user":"a","pass":"b"}')
    const login = jest
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
    const { result } = renderHook(() => useTurboLogin(login))
    await act(() => result.current.handleTurboLogin())
    expect(push).toHaveBeenCalledWith('/')
    push.mockClear()
    await act(() => result.current.handleTurboLogin())
    expect(push).not.toHaveBeenCalled()
  })

  it('reports clipboard problems and clears them', async () => {
    clip(async () => '')
    const { result } = renderHook(() => useTurboLogin(jest.fn()))
    await act(() => result.current.handleTurboLogin())
    expect(result.current.turboError).toMatch(/empty/)
    act(() => result.current.clearTurboError())
    expect(result.current.turboError).toBeNull()
    clip(async () => {
      throw new Error('denied')
    })
    await act(() => result.current.handleTurboLogin())
    expect(result.current.turboError).toMatch(/allow clipboard/)
  })
})
