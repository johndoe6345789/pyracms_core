import {
  SECTIONS,
  albumTarget,
  matchTargets,
  opensText,
  pageTarget,
  tagTarget,
  targetTitle,
} from '@/lib/menuTargets'

const all = [
  ...SECTIONS,
  pageTarget('Train pics', 'Train pics'),
  pageTarget('Trainz', 'Trainz'),
  albumTarget(5, 'Gallery'),
  tagTarget('easy', 1),
]

it('builds routes for pages, albums and tags', () => {
  expect(pageTarget('a b', 'A B').value).toBe('/articles/a%20b')
  expect(albumTarget(5, 'x').value).toBe('/gallery/5')
  expect(tagTarget('file-io', 2)).toMatchObject({
    value: '/tags/file-io',
    hint: '2 items',
  })
  expect(tagTarget('x', 1).hint).toBe('1 item')
})

it('narrows by title or route, best title match first', () => {
  const hits = matchTargets(all, 'train')
  expect(hits.map((h) => h.label)).toEqual(['Train pics', 'Trainz'])
  expect(matchTargets(all, '').length).toBe(all.length)
  expect(matchTargets(all, '/gal').some((t) => t.label === 'Gallery')).toBe(
    true,
  )
})

it('offers a typed outside link or path as itself', () => {
  const out = matchTargets(all, 'https://example.com/x')
  expect(out.at(-1)).toMatchObject({ value: 'https://example.com/x' })
  expect(matchTargets(all, '/forum').length).toBe(1)
  expect(matchTargets(all, 'nothing')).toEqual([])
})

it('names and describes a route', () => {
  expect(targetTitle(all, '/articles/Trainz')).toBe('Trainz')
  expect(targetTitle(all, '/other')).toBe('/other')
  expect(opensText('rog', '/articles/x')).toBe('Opens /site/rog/articles/x')
  expect(opensText('rog', '/')).toBe('Opens /site/rog')
  expect(opensText('rog', 'https://a.io')).toMatch(/outside your site/)
  expect(opensText('rog', '')).toBe('')
})
