import { flagsFromSettings, type FeatureId } from '@/lib/siteFeatures'

export interface Feature {
  id: string
  name: string
  description: string
  enabled: boolean
}

export const FEATURE_DEFS: Omit<Feature, 'enabled'>[] = [
  {
    id: 'articles',
    name: 'Articles',
    description:
      'Content management system for creating and ' +
      'publishing articles, blog posts, and pages.',
  },
  {
    id: 'forum',
    name: 'Forum',
    description:
      'Discussion forums with threaded conversations, ' +
      'categories, and moderation tools.',
  },
  {
    id: 'gallery',
    name: 'Gallery',
    description:
      'Image and media galleries with albums, ' +
      'slideshows, and lightbox support.',
  },
  {
    id: 'code_snippets',
    name: 'Code Snippets',
    description:
      'Syntax-highlighted code sharing with support ' +
      'for multiple programming languages.',
  },
  {
    id: 'hypernucleus',
    name: 'Hypernucleus',
    description:
      'Package management and distribution system ' +
      'for plugins and extensions.',
  },
]

/**
 * Builds the feature list from raw settings records. A feature with no
 * setting is ENABLED (same rule the backend enforces).
 */
export function featuresFromSettings(
  settings: { name?: unknown; value?: unknown }[],
): Feature[] {
  const flags = flagsFromSettings(settings)
  return FEATURE_DEFS.map((f) => ({
    ...f,
    enabled: flags[f.id as FeatureId] !== false,
  }))
}
