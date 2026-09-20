import {
  isFeatureOn,
  type FeatureFlags,
  type FeatureId,
} from '@/lib/siteFeatures'
import type { NavEntry } from './navTypes'

/** Feature behind each module (nav path / home card key); none = always. */
export const MODULE_FEATURE: Record<string, FeatureId> = {
  articles: 'articles',
  forum: 'forum',
  gallery: 'gallery',
  snippets: 'code_snippets',
  games: 'hypernucleus',
  dependencies: 'hypernucleus',
}

/**
 * Drops entries whose feature is off. A group loses its switched-off
 * children and disappears once none are left.
 */
export function filterNavByFeatures(
  entries: NavEntry[],
  flags: FeatureFlags | null,
): NavEntry[] {
  const out: NavEntry[] = []
  for (const entry of entries) {
    if (!isFeatureOn(flags, entry.feature)) continue
    if (!entry.children) {
      out.push(entry)
      continue
    }
    const children = filterNavByFeatures(entry.children, flags)
    if (children.length) out.push({ ...entry, children })
  }
  return out
}
