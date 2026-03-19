'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

/** Shape of the create-site form fields. */
export interface CreateSiteForm {
  slug: string
  name: string
  description: string
}

const INITIAL: CreateSiteForm = {
  slug: '',
  name: '',
  description: '',
}

/** Regex that a valid slug must fully satisfy. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Converts an arbitrary display name into a URL-safe slug.
 *
 * @param name - Raw display name string.
 * @returns Lowercase, hyphenated slug with no leading/trailing hyphens.
 */
function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Hook that manages form state, validation, and submission for
 * creating a new CMS site (tenant).
 */
export function useCreateSite() {
  const router = useRouter()
  const [form, setForm] = useState<CreateSiteForm>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /**
   * Updates a single form field.
   *
   * When `field` is `'name'` and the slug has not yet been manually
   * set, the slug is auto-generated from the new name value.  The
   * check uses the functional `prev` argument so it always reads the
   * latest state rather than a potentially stale closure value.
   *
   * When `field` is `'slug'`, the value is validated against
   * {@link SLUG_PATTERN}; an invalid value sets the error state and
   * leaves the slug unchanged.
   *
   * @param field - Key of {@link CreateSiteForm} to update.
   * @param value - New value for that field.
   */
  const updateField = (
    field: keyof CreateSiteForm,
    value: string,
  ) => {
    if (field === 'slug') {
      if (value !== '' && !SLUG_PATTERN.test(value)) {
        setError(
          'Slug may only contain lowercase letters, numbers, ' +
          'and hyphens, and must not start or end with a hyphen.',
        )
        return
      }
      setError('')
      setForm((prev) => ({ ...prev, slug: value }))
      return
    }

    if (field === 'name') {
      // Use the functional updater so we read prev.slug (latest state)
      // rather than the stale closure value of form.slug.
      setForm((prev) => {
        const auto = prev.slug === '' ? nameToSlug(value) : prev.slug
        return { ...prev, name: value, slug: auto }
      })
      return
    }

    setForm((prev) => ({ ...prev, [field]: value }))
  }

  /**
   * Resets the form to its initial empty state and clears any error.
   */
  const resetForm = () => {
    setForm(INITIAL)
    setError('')
  }

  /**
   * Submits the form to `POST /api/tenants`.
   *
   * On success the router navigates to `/site/{slug}`.
   * On failure an error message is stored in `error`.
   *
   * @param e - The React form-submission event.
   */
  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/api/tenants', {
        slug: form.slug,
        displayName: form.name,
        description: form.description,
      })
      router.push(`/site/${form.slug}`)
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'response' in err
      ) {
        const r = (
          err as { response: { data?: { error?: string } } }
        ).response
        setError(r?.data?.error || 'Failed to create site')
      } else {
        setError('Unable to connect to server')
      }
    } finally {
      setLoading(false)
    }
  }

  return { form, updateField, loading, error, handleSubmit, resetForm }
}
