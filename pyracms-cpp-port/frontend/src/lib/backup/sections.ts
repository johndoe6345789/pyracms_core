import { albumsSection } from './albums'
import { articlesSection } from './articles'
import { menuSection } from './menu'
import { settingsSection } from './settings'
import { snippetsSection } from './snippets'
import type { SectionDef, SectionKey } from './types'

export const SECTIONS: SectionDef[] = [
  settingsSection,
  menuSection,
  articlesSection,
  snippetsSection,
  albumsSection,
]

export const sectionByKey = (key: SectionKey) =>
  SECTIONS.find((s) => s.key === key) as SectionDef
