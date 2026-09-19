import { renderHook, act, waitFor } from '@testing-library/react'
import {
  useRevisions,
  mapRevisions,
  mapDiffRevisions,
} from '@/hooks/useRevisions'
import { m } from '../../helpers/scopeApi'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)

beforeEach(() => jest.resetAllMocks())

it('maps revisions', () => {
  const r = mapRevisions([
    {
      revisionNumber: 2,
      authorUsername: 'a',
      summary: 's',
      createdAt: '2024-01-02 03:04:05+00',
    },
    { id: 3, userId: 5 },
    { id: 4, userId: 0 },
  ])
  expect(r[0]!.author).toBe('a')
  expect(r[1]).toMatchObject({
    number: 3,
    author: 'User #5',
    date: '',
    summary: '',
  })
  expect(r[2]!.author).toBe('Deleted user')
})

it('loads and reverts', async () => {
  m.get.mockResolvedValue({ data: [{ revisionNumber: 7 }] })
  m.post.mockResolvedValue({})
  const { result } = renderHook(() => useRevisions('n', 1))
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.latestRevision).toBe(7)
  m.get.mockResolvedValue({ data: null })
  await act(() => result.current.handleRevert(7))
  expect(result.current.revisions).toEqual([])
})

it('rejects revert without tenant; tolerates load error', async () => {
  const a = renderHook(() => useRevisions('n', null))
  await expect(a.result.current.handleRevert(1)).rejects.toBeUndefined()
  expect(a.result.current.latestRevision).toBe(0)
  m.get.mockRejectedValue(new Error('x'))
  const b = renderHook(() => useRevisions('n', 1))
  await waitFor(() => expect(b.result.current.loading).toBe(false))
})

it('maps diff revisions oldest first with their content', () => {
  const d = mapDiffRevisions([
    { id: 9, revisionNumber: 2, content: 'new', authorUsername: 'a' },
    { id: 5, revisionNumber: 1, content: 'old' },
    { revisionNumber: 3, content: 4 },
  ])
  expect(d.map((x) => x.id)).toEqual(['3', '5', '9'])
  expect(d[1]).toMatchObject({ label: 'Revision #1', content: 'old' })
  expect(d[0]!.content).toBe('')
})
