import {
  baseName,
  childFolders,
  parentOf,
  trail,
  withAncestors,
} from '@/lib/folderPath'

it('works out parents, names and trails', () => {
  expect(parentOf('a/b/c')).toBe('a/b')
  expect(parentOf('a')).toBe('')
  expect(baseName('a/b')).toBe('b')
  expect(trail('a/b/c')).toEqual(['a', 'a/b', 'a/b/c'])
  expect(trail('')).toEqual([])
})

it('lists the folders directly inside another and fills in ancestors', () => {
  const all = ['a', 'a/b', 'a/b/c', 'z']
  expect(childFolders(all, '')).toEqual(['a', 'z'])
  expect(childFolders(all, 'a')).toEqual(['a/b'])
  expect(withAncestors(['x/y/z', 'a'])).toEqual(['a', 'x', 'x/y', 'x/y/z'])
})
