/** Shape of the create-site form fields. */
export interface CreateSiteForm {
  slug: string
  name: string
  description: string
}

export const INITIAL: CreateSiteForm = {
  slug: '',
  name: '',
  description: '',
}

/** Regex that a valid slug must fully satisfy. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const SLUG_ERROR =
  'Slug must be lowercase letters/numbers separated by ' +
  'single hyphens, no leading/trailing hyphens'

/**
 * Converts an arbitrary display name into a URL-safe slug.
 *
 * @returns Lowercase, hyphenated slug with no leading/trailing hyphens.
 */
export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Human-readable message for a failed create-site request. */
export function createSiteError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (err as { response: { data?: { error?: string } } }).response
    return r?.data?.error || 'Failed to create site'
  }
  return 'Unable to connect to server'
}
