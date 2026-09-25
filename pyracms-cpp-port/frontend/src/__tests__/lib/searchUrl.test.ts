import { siteUrl } from '@/lib/searchUrl'

it('puts a hit under its site', () => {
  expect(siteUrl('rog', '/articles/x')).toBe('/site/rog/articles/x')
  expect(siteUrl('rog', '/site/rog/articles/x')).toBe('/site/rog/articles/x')
  expect(siteUrl('', '/articles/x')).toBe('/articles/x')
  expect(siteUrl('rog', 'https://e.com')).toBe('https://e.com')
})
