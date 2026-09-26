import { exploreEntry, searchEntry } from '@/components/layout/exploreNav'

it('the Search link goes to the site search, not the portal', () => {
  expect(searchEntry('rog').href).toBe('/site/rog/search')
  const explore = exploreEntry('rog', [], false)
  expect(explore.children?.map((c) => c.href)).toContain('/site/rog/search')
})
