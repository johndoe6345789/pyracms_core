/** Something a menu link can point at, offered while the owner types. */
export interface MenuTarget {
  /** The route stored on the item: /articles/x, /gallery/3, https://... */
  value: string
  label: string
  group: string
  hint?: string
}

export const SECTION_GROUP = 'Site sections'
export const PAGE_GROUP = 'Pages'
export const ALBUM_GROUP = 'Photo albums'
export const TAG_GROUP = 'Tags'
export const OUTSIDE_GROUP = 'Outside link'

export const SECTIONS: MenuTarget[] = [
  { value: '/', label: 'Home', group: SECTION_GROUP },
  { value: '/articles', label: 'All articles', group: SECTION_GROUP },
  { value: '/forum', label: 'Forum', group: SECTION_GROUP },
  { value: '/gallery', label: 'Photo albums', group: SECTION_GROUP },
  { value: '/snippets', label: 'Code snippets', group: SECTION_GROUP },
  { value: '/tags', label: 'Tag cloud', group: SECTION_GROUP },
  { value: '/games', label: 'Games', group: SECTION_GROUP },
  { value: '/dependencies', label: 'Game dependencies', group: SECTION_GROUP },
  { value: '/download', label: 'Download the client', group: SECTION_GROUP },
]

const enc = encodeURIComponent

export const pageTarget = (name: string, title: string): MenuTarget => ({
  value: `/articles/${enc(name)}`,
  label: title || name,
  group: PAGE_GROUP,
})

export const albumTarget = (id: number, title: string): MenuTarget => ({
  value: `/gallery/${id}`,
  label: title,
  group: ALBUM_GROUP,
})

export const tagTarget = (tag: string, uses: number): MenuTarget => ({
  value: `/tags/${enc(tag)}`,
  label: tag,
  group: TAG_GROUP,
  hint: `${uses} item${uses === 1 ? '' : 's'}`,
})
