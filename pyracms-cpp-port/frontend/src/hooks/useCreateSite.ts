'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import {
  INITIAL, SLUG_PATTERN, SLUG_ERROR, nameToSlug, createSiteError,
  type CreateSiteForm,
} from './createSiteForm'

export type { CreateSiteForm }

/**
 * Manages form state, validation, and submission for creating a new
 * CMS site (tenant).
 */
export function useCreateSite() {
  const router = useRouter()
  const [form, setForm] = useState<CreateSiteForm>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /**
   * Updates a single form field. Changing `name` auto-generates the
   * slug while it is still empty (read from `prev`, never a stale
   * closure); an invalid `slug` sets the error and is ignored.
   */
  const updateField = (field: keyof CreateSiteForm, value: string) => {
    if (field === 'slug') {
      if (value !== '' && !SLUG_PATTERN.test(value)) {
        setError(SLUG_ERROR)
        return
      }
      setError('')
      setForm((prev) => ({ ...prev, slug: value }))
      return
    }
    if (field === 'name') {
      setForm((prev) => ({ ...prev, name: value,
        slug: prev.slug === '' ? nameToSlug(value) : prev.slug }))
      return
    }
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  /** Resets the form to its initial empty state and clears any error. */
  const resetForm = () => {
    setForm(INITIAL)
    setError('')
  }

  /** Submits to `POST /api/tenants`, then navigates to `/site/{slug}`. */
  const handleSubmit = async (e: React.FormEvent) => {
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
      setError(createSiteError(err))
    } finally {
      setLoading(false)
    }
  }

  return { form, updateField, loading, error, handleSubmit, resetForm }
}
