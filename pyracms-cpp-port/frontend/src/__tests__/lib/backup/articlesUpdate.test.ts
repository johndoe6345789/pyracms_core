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

it('updates an existing article only where it differs', async () => {
  m.get.mockResolvedValue({
    data: {
      content: 'old',
      rendererName: 'html',
      isPrivate: false,
      status: 'draft',
    },
  })
  const out = await articlesSection.restore(
    [
      art,
      {
        ...art,
        name: 'b',
        status: 'published',
        isPrivate: false,
        content: 'old',
        renderer: 'html',
      },
    ],
    1,
    noop,
  )
  expect(out.updated).toBe(2)
  expect(m.put).toHaveBeenCalledWith(
    '/api/articles/a',
    expect.objectContaining({ content: 'new' }),
  )
  expect(m.put).toHaveBeenCalledWith(
    '/api/articles/a/renderer',
    expect.objectContaining({ renderer: 'markdown' }),
  )
  expect(m.post).toHaveBeenCalledWith('/api/articles/b/publish', {
    tenant_id: 1,
  })
  expect(m.post).not.toHaveBeenCalledWith(
    '/api/articles/a/unpublish',
    expect.anything(),
  )
})

it('leaves scheduled articles alone and reports failures', async () => {
  m.get.mockRejectedValue(new Error('404'))
  m.post.mockRejectedValueOnce({ response: { data: { error: 'bad name' } } })
  const out = await articlesSection.restore(
    [art, { ...art, name: 'c', status: 'scheduled', isPrivate: false }],
    1,
    noop,
  )
  expect(out.failed).toEqual(['a: bad name'])
  expect(m.post).not.toHaveBeenCalledWith(
    '/api/articles/c/publish',
    expect.anything(),
  )
  expect(m.post).not.toHaveBeenCalledWith(
    '/api/articles/c/unpublish',
    expect.anything(),
  )
})
