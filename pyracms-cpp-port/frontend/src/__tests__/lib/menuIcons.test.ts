import {
  ICON_CATEGORIES,
  ICON_COUNT,
  iconFor,
  searchIcons,
} from '@/lib/menuIcons'

it('is a big library, grouped, with no duplicate names', () => {
  expect(ICON_COUNT).toBeGreaterThanOrEqual(300)
  expect(ICON_CATEGORIES.length).toBeGreaterThanOrEqual(10)
  const all = ICON_CATEGORIES.flatMap((c) => c.icons.map((i) => i.name))
  expect(new Set(all).size).toBe(all.length)
  for (const n of all) expect(n).toMatch(/^[A-Za-z0-9]+Outlined$/)
})

it('finds an icon by its stored name, and nothing for unknown ones', () => {
  expect(iconFor('TrainOutlined')?.label).toBe('Train')
  expect(iconFor('DirectionsRailwayOutlined')?.label).toBe('Directions Railway')
  expect(iconFor('Nope')).toBeUndefined()
  expect(iconFor('')).toBeUndefined()
})

it('searches by every word, in names and subject headings', () => {
  expect(searchIcons('train').map((i) => i.name)).toContain('TrainOutlined')
  expect(searchIcons('train zzz').length).toBe(0)
  expect(searchIcons('railway').map((i) => i.name)).toContain(
    'DirectionsRailwayOutlined',
  )
  expect(searchIcons('transport train').length).toBeGreaterThan(0)
  expect(searchIcons('  ').length).toBe(ICON_COUNT)
  expect(searchIcons('zzzz')).toEqual([])
})
