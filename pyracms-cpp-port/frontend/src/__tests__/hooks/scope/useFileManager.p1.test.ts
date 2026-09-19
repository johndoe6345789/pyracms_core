import { renderHook, act, waitFor } from '@testing-library/react'
import { useFileManager, formatFileSize } from '@/hooks/useFileManager'
import { m } from '../../helpers/scopeApi'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

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

it('formats sizes', () => {
  expect(formatFileSize(5)).toBe('5 B')
  expect(formatFileSize(2048)).toBe('2.0 KB')
  expect(formatFileSize(3 * 1048576)).toBe('3.0 MB')
})

it('loads and deletes', async () => {
  const { result } = await setup()
  expect(result.current.files[1]).toMatchObject({ name: '', size: 0 })
  act(() => result.current.handleDeleteConfirm())
  act(() => result.current.handleDeleteClick(result.current.files[0]!))
  expect(result.current.deleteDialogOpen).toBe(true)
  act(() => result.current.handleDeleteCancel())
  act(() => result.current.handleDeleteClick(result.current.files[0]!))
  act(() => result.current.handleDeleteConfirm())
  await waitFor(() => expect(result.current.files).toHaveLength(1))
})

it('tolerates errors and null data', async () => {
  m.get.mockResolvedValue({ data: null })
  await setup()
  m.get.mockRejectedValue(new Error('x'))
  const { result } = await setup()
  m.delete.mockRejectedValue(new Error('x'))
  act(() =>
    result.current.handleDeleteClick({
      id: 1,
      uuid: 'u',
      name: '',
      size: 0,
      type: '',
      downloads: 0,
      uploadedAt: '',
    }),
  )
  act(() => result.current.handleDeleteConfirm())
  await setup(null)
})
