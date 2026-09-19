'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { useFormSubmit } from '@/hooks/useFormSubmit'

/** Request a reset e-mail for `tenant`'s account scope (or the platform). */
export function useForgotPassword(tenant?: string) {
  const [email, setEmail] = useState('')
  const f = useFormSubmit('Could not send the reset link')
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return f.fail('Email is required')
    return f.run(() =>
      api.post('/api/auth/forgot-password', {
        email: email.trim(),
        ...(tenant ? { tenant } : {}),
      }),
    )
  }
  return { email, setEmail, submit, ...f }
}
