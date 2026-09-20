import { renderHook, act, waitFor } from '@testing-library/react'
import { useCreateArticle as useCreate } from '../helpers/createArticleHook'

const post = jest.fn()
const push = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: (...a: unknown[]) => post(...a) },
}))

function start(renderer: string) {
  const hook = renderHook(() => useCreate('demo', 7))
  act(() => {
    hook.result.current.editor.setTitle('Another Test')
    hook.result.current.editor.setContent('body')
    hook.result.current.editor.setRenderer(renderer)
  })
  return hook
}

beforeEach(() => jest.clearAllMocks())

describe('useCreateArticle', () => {
  it('sends reStructuredText as restructuredtext', async () => {
    post.mockResolvedValue({ data: {} })
    const { result } = start('reStructuredText')
    act(() => result.current.create())
    await waitFor(() => expect(push).toHaveBeenCalled())
    expect(post.mock.calls[0]?.[1]).toMatchObject({
      name: 'another-test',
      renderer: 'restructuredtext',
      tenant_id: 7,
    })
  })

  it('says why it failed, with details behind the arrow', async () => {
    post.mockRejectedValue({
      response: {
        status: 403,
        data: { error: 'Writing articles needs Moderator level' },
      },
    })
    const { result } = start('Markdown')
    act(() => result.current.create())
    await waitFor(() => expect(result.current.error).not.toBe(''))
    expect(result.current.error).toBe('Writing articles needs Moderator level')
    expect(result.current.errorDetails).toContain('Status: 403')
    expect(result.current.errorDetails).toContain('POST /api/articles')
    expect(push).not.toHaveBeenCalled()
  })

  it('clears the previous error on the next attempt', async () => {
    post.mockRejectedValueOnce({
      response: { status: 409, data: { error: 'Already exists' } },
    })
    post.mockResolvedValueOnce({ data: {} })
    const { result } = start('HTML')
    act(() => result.current.create())
    await waitFor(() => expect(result.current.error).toBe('Already exists'))
    act(() => result.current.create())
    await waitFor(() => expect(push).toHaveBeenCalled())
    expect(result.current.error).toBe('')
    expect(result.current.errorDetails).toBe('')
  })
})
