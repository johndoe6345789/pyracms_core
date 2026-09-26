import { settingsSection } from '@/lib/backup/settings'
import { fetchAllPages } from '@/lib/backup/pages'
import { m } from '../../helpers/scopeApi'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

const noop = () => {}
beforeEach(() => {
  jest.resetAllMocks()
  m.put.mockResolvedValue({})
  m.post.mockResolvedValue({ data: { id: 7 } })
})

it('reads every page of a list', async () => {
  const page = (n: number) => Array.from({ length: n }, (_, i) => i)
  m.get
    .mockResolvedValueOnce({ data: page(100) })
    .mockResolvedValueOnce({ data: page(3) })
  const all = await fetchAllPages('/x', {}, (d) => d as number[])
  expect(all).toHaveLength(103)
  expect(m.get.mock.calls[1][1].params.offset).toBe(100)
})

it('keeps going when a setting fails, and says which', async () => {
  m.put.mockRejectedValueOnce({ response: { data: { error: 'nope' } } })
  m.put.mockRejectedValueOnce(new Error('x'))
  m.put.mockResolvedValueOnce({})
  const rows = [
    { key: 'a', value: '1' },
    { key: 'b', value: '2' },
    { key: 'c', value: 3 },
  ]
  const out = await settingsSection.restore(rows, 1, noop)
  expect(out).toMatchObject({ updated: 1, failed: ['a: nope', 'b: failed'] })
})
