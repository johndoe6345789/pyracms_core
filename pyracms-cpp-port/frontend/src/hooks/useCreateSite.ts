'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import {
  INITIAL,
  SLUG_PATTERN,
  SLUG_ERROR,
  nameToSlug,
  createSiteError,
  adminProblem,
  type CreateSiteForm,
} from './createSiteForm'
import { submitNewSite } from './createSiteSubmit'

export type { CreateSiteForm }

/** Form state, validation and submission for creating a new site. */
export function useCreateSite() {
  const router = useRouter()
  const dispatch = useDispatch()
  const [form, setForm] = useState<CreateSiteForm>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /** `name` fills an empty slug; an invalid `slug` is ignored + flagged. */
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
      setForm((prev) => ({
        ...prev,
        name: value,
        slug: prev.slug === '' ? nameToSlug(value) : prev.slug,
      }))
      return
    }
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  /** Resets the form to its initial empty state and clears any error. */
  const resetForm = () => {
    setForm(INITIAL)
    setError('')
  }

  /**
   * Submits to `POST /api/sites`, which creates the site together with its
   * Administrator account, then signs that account in and opens the site.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const problem = adminProblem(form)
    if (problem) return setError(problem)
    setError('')
    setLoading(true)
    try {
      await submitNewSite(form, dispatch)
      router.push(`/site/${form.slug}/admin`)
    } catch (err: unknown) {
      setError(createSiteError(err))
    } finally {
      setLoading(false)
    }
  }

  return { form, updateField, loading, error, handleSubmit, resetForm }
}
