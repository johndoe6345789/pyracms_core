import { renderHook, waitFor, act } from '@testing-library/react'
import api from '@/lib/api'
import { useSnippet } from '@/hooks/useSnippet'
import { useSnippetRun } from '@/hooks/useSnippetRun'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}))
const mock = asMockApi<'get' | 'post'>(api)

beforeEach(() => {
  mock.get.mockReset()
  mock.post.mockReset()
})

describe('useSnippet', () => {
  it('loads and reloads a snippet', async () => {
    mock.get.mockResolvedValue({ data: { id: 3, title: 'T' } })
    const { result } = renderHook(() => useSnippet('3'))
    await waitFor(() => expect(result.current.snippet?.title).toBe('T'))
    act(() => result.current.reload())
    await waitFor(() => expect(mock.get).toHaveBeenCalledTimes(2))
  })
  it('flags a missing snippet', async () => {
    mock.get.mockRejectedValue(new Error('404'))
    const { result } = renderHook(() => useSnippet('3'))
    await waitFor(() => expect(result.current.notFound).toBe(true))
  })
})

describe('useSnippetRun', () => {
  it('stores the run result', async () => {
    mock.post.mockResolvedValue({ data: { output: 'ok', exitCode: 0 } })
    const { result } = renderHook(() => useSnippetRun())
    await act(async () => {
      await result.current.run('1')
    })
    expect(mock.post).toHaveBeenCalledWith('/api/snippets/1/run')
    expect(result.current.result?.stdout).toBe('ok')
    expect(result.current.running).toBe(false)
  })
  it('explains auth and generic failures', async () => {
    const { result } = renderHook(() => useSnippetRun())
    mock.post.mockRejectedValueOnce({ response: { status: 401 } })
    await act(async () => {
      await result.current.run('1')
    })
    expect(result.current.result?.stderr).toMatch(/log in/)
    mock.post.mockRejectedValueOnce(new Error('x'))
    await act(async () => {
      await result.current.run('1')
    })
    expect(result.current.result?.stderr).toBe('Failed to run snippet.')
  })
})
