import { renderHook, act, waitFor } from '@testing-library/react'
import { useFileManager } from '@/hooks/useFileManager'
import { m } from '../../helpers/scopeApi'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)

const raw = [
  { id: 1, filename: 'a.txt', uuid: 'u1', createdAt: '2024-01-01T00:00' },
  { id: 2 },
]

beforeEach(() => {
  jest.resetAllMocks()
  m.get.mockResolvedValue({ data: raw })
  m.delete.mockResolvedValue({})
})

const setup = async (t: number | null = 1) => {
  const h = renderHook(() => useFileManager(t))
  await waitFor(() => expect(h.result.current.loading).toBe(t === null))
  return h
}

it('uploads and handles drag events', async () => {
  const { result } = await setup()
  m.post.mockResolvedValueOnce({ data: { id: 5, filename: 'n' } })
  const file = new File(['abc'], 'up.txt', { type: 'text/plain' })
  act(() => result.current.uploadFiles([file] as unknown as FileList))
  await waitFor(() => expect(result.current.files).toHaveLength(3))
  m.post.mockRejectedValueOnce(new Error('x'))
  act(() => result.current.uploadFiles([file] as unknown as FileList))
  const ev = { preventDefault: jest.fn() } as never
  act(() => result.current.handleDragOver(ev))
  expect(result.current.dragOver).toBe(true)
  act(() => result.current.handleDragLeave())
  expect(result.current.dragOver).toBe(false)
  m.post.mockResolvedValueOnce({ data: { id: 6 } })
  act(() =>
    result.current.handleDrop({
      preventDefault: jest.fn(),
      dataTransfer: { files: [file] },
    } as never),
  )
  await waitFor(() => expect(result.current.files).toHaveLength(4))
  expect(result.current.files[3]!.name).toBe('up.txt')
  act(() =>
    result.current.handleDrop({
      preventDefault: jest.fn(),
      dataTransfer: { files: [] },
    } as never),
  )
})

it('ignores uploads without tenant', async () => {
  const { result } = await setup(null)
  act(() => result.current.uploadFiles([new File([''], 'a')] as never))
  expect(m.post).not.toHaveBeenCalled()
})
