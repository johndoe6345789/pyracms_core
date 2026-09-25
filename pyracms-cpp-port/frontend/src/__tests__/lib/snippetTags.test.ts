import { parseTags, saveErrorMessage } from '@/lib/snippetTags'

it('parses the tag editor text', () => {
  expect(parseTags(' a, b ,,c ')).toEqual(['a', 'b', 'c'])
  expect(parseTags('')).toEqual([])
})

it('explains a failed save', () => {
  expect(saveErrorMessage({ response: { status: 401 } })).toMatch(/log in/)
  expect(saveErrorMessage(new Error('x'))).toBe('Failed to save snippet.')
})
