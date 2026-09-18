import type { ReactNode } from 'react'

/** One destination in the top bar and burger drawer. */
export interface NavEntry {
  key: string
  label: string
  href: string
  icon: ReactNode
  /** Highlight only on an exact path match (e.g. home) */
  exact?: boolean
  testId?: string
}

/** A titled group of destinations in the drawer. */
export interface NavSection {
  title?: string
  items: NavEntry[]
}

export function isActive(pathname: string, entry: NavEntry): boolean {
  const path = entry.href.split('#')[0] ?? entry.href
  if (entry.exact) return pathname === path
  return pathname === path || pathname.startsWith(`${path}/`)
}
