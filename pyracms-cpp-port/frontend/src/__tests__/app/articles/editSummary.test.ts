import {
  buildRevisionSummary, sameTags, matchRenderer, parseTagsInput,
} from '@/app/site/[slug]/(tenant)/articles/[name]/edit/editSummary'

it('builds revision summaries', () => {
  const o = { content: 'a', renderer: 'HTML', tagsInput: 'x, y' }
  expect(buildRevisionSummary(o, o)).toBe('')
  expect(buildRevisionSummary(o, { content: 'b', renderer: 'Markdown',
    tagsInput: 'z' })).toBe('Updated content, renderer, tags')
})

it('compares tags case-insensitively', () => {
  expect(sameTags('A, b', 'b,a')).toBe(true)
  expect(sameTags('a', 'a,b')).toBe(false)
  expect(parseTagsInput('a, ,b')).toEqual(['a', 'b'])
})

it('matches renderer names', () => {
  expect(matchRenderer('html')).toBe('HTML')
  expect(matchRenderer('bbcode')).toBe('BBCode')
  expect(matchRenderer('other')).toBe('Other')
})
