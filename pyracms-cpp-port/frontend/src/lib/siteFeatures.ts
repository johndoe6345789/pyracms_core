/**
 * Site feature toggles, stored as tenant settings `feature_<id>`.
 *
 * Semantics (mirrors the backend FeatureGate): a feature is ENABLED unless
 * its setting is explicitly "false" for that site. A missing setting means
 * on, so sites that never opened the toggles page keep working.
 * `hypernucleus` covers Games, Dependencies and the client download.
 */
export const FEATURE_IDS = [
  'articles',
  'forum',
  'gallery',
  'code_snippets',
  'hypernucleus',
] as const

export type FeatureId = (typeof FEATURE_IDS)[number]
export type FeatureFlags = Record<FeatureId, boolean>

export const ALL_ON: FeatureFlags = {
  articles: true,
  forum: true,
  gallery: true,
  code_snippets: true,
  hypernucleus: true,
}

/** Reads the flags out of raw settings records (missing = enabled). */
export function flagsFromSettings(
  settings: { name?: unknown; value?: unknown }[],
): FeatureFlags {
  const flags = { ...ALL_ON }
  for (const s of settings) {
    if (typeof s.name !== 'string' || !s.name.startsWith('feature_')) continue
    const id = s.name.slice('feature_'.length) as FeatureId
    if (id in flags) flags[id] = String(s.value) !== 'false'
  }
  return flags
}

/** True unless `id` is known and switched off. */
export function isFeatureOn(
  flags: FeatureFlags | null,
  id: FeatureId | undefined,
): boolean {
  return !flags || !id || flags[id] !== false
}
