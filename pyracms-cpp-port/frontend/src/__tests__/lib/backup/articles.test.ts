import { m, noop } from '../../helpers/backupSetup'
import { articlesSection } from '@/lib/backup/articles'

const art = {
  name: 'a',
  displayName: 'A',
  content: 'new',
  renderer: 'markdown',
  status: 'draft',
  isPrivate: true,
  tags: ['t'],
}

it('backs up articles and skips ones that vanish', async () => {
  m.get.mockImplementation((url: string) =>
    url.endsWith('/gone')
      ? Promise.reject(new Error('404'))
      : url.endsWith('/a')
        ? Promise.resolve({
            data: {
              name: 'a',
              displayName: 'A',
              content: 'c',
              rendererName: 'markdown',
              status: 'published',
              isPrivate: false,
            },
          })
        : Promise.resolve({
            data: [
              { name: 'a', displayName: 'A' },
              { name: 'gone', displayName: 'G' },
            ],
          }),
  )
  const rows = await articlesSection.collect(1, noop)
  expect(rows).toEqual([
    {
      name: 'a',
      displayName: 'A',
      content: 'c',
      renderer: 'markdown',
      status: 'published',
      isPrivate: false,
      tags: [],
    },
  ])
})

it('creates a missing article, then sets privacy, state and tags', async () => {
  m.get.mockRejectedValue(new Error('404'))
  const out = await articlesSection.restore([art], 1, noop)
  expect(out.created).toBe(1)
  expect(m.put).toHaveBeenCalledWith('/api/articles/a/private', {
    tenant_id: 1,
  })
  expect(m.put).toHaveBeenCalledWith('/api/articles/a/tags', {
    tenant_id: 1,
    tags: ['t'],
  })
  expect(m.post).toHaveBeenCalledWith('/api/articles/a/unpublish', {
    tenant_id: 1,
  })
  expect(m.post).toHaveBeenCalledWith(
    '/api/articles',
    expect.objectContaining({ tenant_id: 1, content: 'new' }),
  )
})
