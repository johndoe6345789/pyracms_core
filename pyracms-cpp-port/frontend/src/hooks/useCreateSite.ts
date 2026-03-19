'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

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

export function useCreateSite() {
  const router = useRouter()
  const [form, setForm] = useState<CreateSiteForm>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateField = (
    field: keyof CreateSiteForm,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field === 'name' && !form.slug) {
      setForm((prev) => ({
        ...prev,
        name: value,
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      }))
    }
  }

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

  return { form, updateField, loading, error, handleSubmit }
}
