'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { useFormSubmit } from '@/hooks/useFormSubmit'

export interface ProfileFields {
  fullName: string
  email: string
  website: string
  aboutme: string
  timezone: string
}

const EMPTY: ProfileFields = {
  fullName: '', email: '', website: '', aboutme: '', timezone: '',
}

/** Loads and saves the signed-in user's own profile fields. */
export function useProfileEdit(userId: number | undefined) {
  const [fields, setFields] = useState<ProfileFields>(EMPTY)
  const [loading, setLoading] = useState(Boolean(userId))
  const f = useFormSubmit('Could not save your profile')

  useEffect(() => {
    if (!userId) return
    api.get(`/api/users/${userId}`)
      .then((r) => setFields({
        fullName: r.data.fullName ?? '',
        email: r.data.email ?? '',
        website: r.data.website ?? '',
        aboutme: r.data.aboutme ?? '',
        timezone: r.data.timezone ?? '',
      }))
      .catch(() => f.fail('Could not load your profile'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const set = (k: keyof ProfileFields, v: string) =>
    setFields((p) => ({ ...p, [k]: v }))
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    return f.run(() => api.put(`/api/users/${userId}`, fields))
  }

  return { fields, set, loading, submit, ...f }
}
