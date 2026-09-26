import { m, noop } from '../../helpers/backupSetup'
import { snippetsSection } from '@/lib/backup/snippets'

it('backs up snippets and restores by title and language', async () => {
  const list = { items: [{ id: 3, title: 'Hi', language: 'python' }] }
  m.get.mockImplementation((url: string) =>
    Promise.resolve({
      data: url.endsWith('/3')
        ? {
            title: 'Hi',
            code: 'x',
            language: 'python',
            visibility: 'public',
            tags: ['a'],
          }
        : list,
    }),
  )
  const rows = await snippetsSection.collect(1, noop)
  expect(rows).toEqual([
    {
      title: 'Hi',
      code: 'x',
      language: 'python',
      visibility: 'public',
      tags: ['a'],
    },
  ])
  const out = await snippetsSection.restore(
    [...rows, { ...(rows[0] as object), title: 'New', tags: ['b'] }],
    1,
    noop,
  )
  expect(out).toMatchObject({ created: 1, updated: 1 })
  expect(m.put).toHaveBeenCalledWith(
    '/api/snippets/3',
    expect.objectContaining({ code: 'x', tenant_id: 1 }),
  )
  expect(m.put).toHaveBeenCalledWith('/api/snippets/7/tags', { tags: ['b'] })
})

it('snippet list without items is treated as empty', async () => {
  m.get.mockResolvedValue({ data: {} })
  expect(await snippetsSection.collect(1, noop)).toEqual([])
})
