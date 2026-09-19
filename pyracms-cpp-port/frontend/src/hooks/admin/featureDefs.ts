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

/** Builds the feature list from raw settings records. */
export function featuresFromSettings(
  settings: { name?: unknown; value?: unknown }[],
): Feature[] {
  const on: Record<string, string> = {}
  for (const s of settings) {
    if (typeof s.name === 'string' && s.name.startsWith('feature_')) {
      on[s.name.replace('feature_', '')] = String(s.value)
    }
  }
  return FEATURE_DEFS.map((f) => ({
    ...f,
    enabled: on[f.id] === 'true',
  }))
}
