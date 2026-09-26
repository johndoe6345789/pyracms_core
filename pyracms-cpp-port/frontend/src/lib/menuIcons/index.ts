import type { IconCategory, IconEntry } from './types'
import { NAVIGATION_ICONS } from './navigation'
import { CONTENT_ICONS } from './content'
import { MEDIA_ICONS } from './media'
import { TRANSPORT_ICONS } from './transport'
import { CODE_AND_TECH_ICONS } from './code_and_tech'
import { MATHS_AND_SCIENCE_ICONS } from './maths_and_science'
import { PEOPLE_AND_SOCIAL_ICONS } from './people_and_social'
import { GAMES_AND_SPORT_ICONS } from './games_and_sport'
import { HOME_AND_NATURE_ICONS } from './home_and_nature'
import { SHOP_AND_WORK_ICONS } from './shop_and_work'
import { FILES_AND_ACTIONS_ICONS } from './files_and_actions'
import { WEATHER_AND_TIME_ICONS } from './weather_and_time'

export type { IconCategory, IconEntry }

/** Every icon a menu entry can show, grouped by subject. */
export const ICON_CATEGORIES: IconCategory[] = [
  { title: 'Navigation', icons: NAVIGATION_ICONS },
  { title: 'Content', icons: CONTENT_ICONS },
  { title: 'Media', icons: MEDIA_ICONS },
  { title: 'Transport', icons: TRANSPORT_ICONS },
  { title: 'Code and tech', icons: CODE_AND_TECH_ICONS },
  { title: 'Maths and science', icons: MATHS_AND_SCIENCE_ICONS },
  { title: 'People and social', icons: PEOPLE_AND_SOCIAL_ICONS },
  { title: 'Games and sport', icons: GAMES_AND_SPORT_ICONS },
  { title: 'Home and nature', icons: HOME_AND_NATURE_ICONS },
  { title: 'Shop and work', icons: SHOP_AND_WORK_ICONS },
  { title: 'Files and actions', icons: FILES_AND_ACTIONS_ICONS },
  { title: 'Weather and time', icons: WEATHER_AND_TIME_ICONS },
]

const BY_NAME = new Map<string, IconEntry>(
  ICON_CATEGORIES.flatMap((c) => c.icons).map((i) => [i.name, i]),
)

export const ICON_COUNT = BY_NAME.size

/** The icon stored under this name, or undefined (unknown/empty). */
export function iconFor(name: string): IconEntry | undefined {
  return BY_NAME.get(name)
}

/** Icons whose name or subject contains every word typed. */
export function searchIcons(query: string): IconEntry[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return [...BY_NAME.values()]
  return ICON_CATEGORIES.flatMap((c) =>
    c.icons.filter((i) =>
      words.every((w) => `${i.label} ${c.title}`.toLowerCase().includes(w)),
    ),
  )
}
