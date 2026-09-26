import {
  MARK_CLOSE,
  MARK_OPEN,
  splitMarks,
  stripMarks,
} from '@/lib/search/marks'
import { kindOf, KIND_ORDER } from '@/lib/search/kinds'
import { searchPagePath } from '@/lib/searchUrl'

const m = (s: string) => `${MARK_OPEN}${s}${MARK_CLOSE}`

it('splits matched words from the text around them', () => {
  expect(splitMarks(`a ${m('golf')} b`)).toEqual([
    { text: 'a ', hit: false },
    { text: 'golf', hit: true },
    { text: ' b', hit: false },
  ])
  expect(splitMarks('')).toEqual([])
})

it('never treats markup as markup', () => {
  const [piece] = splitMarks(m('<img src=x onerror=1>'))
  expect(piece).toEqual({ text: '<img src=x onerror=1>', hit: true })
  expect(stripMarks(`x${m('y')}z`)).toBe('xyz')
})

it('knows every kind and falls back for new ones', () => {
  for (const k of KIND_ORDER) expect(kindOf(k).label).not.toBe(k)
  expect(kindOf('podcast')).toMatchObject({ label: 'podcast' })
})

it('builds a site search address', () => {
  expect(searchPagePath('rog')).toBe('/site/rog/search')
  expect(searchPagePath('rog', { q: 'golf', type: 'all', page: 1 })).toBe(
    '/site/rog/search?q=golf',
  )
  expect(searchPagePath('rog', { q: 'a b', type: 'snippet', page: 3 })).toBe(
    '/site/rog/search?q=a+b&type=snippet&page=3',
  )
})
