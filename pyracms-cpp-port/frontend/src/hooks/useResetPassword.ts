'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { useFormSubmit } from '@/hooks/useFormSubmit'

export function passwordProblem(pw: string, confirm: string): string {
  if (pw.length < 8) return 'Password must be at least 8 characters'
  if (pw.length > 256) return 'Password must be at most 256 characters'
  if (pw !== confirm) return 'Passwords do not match'
  return ''
}

/** Set a new password using the token from the reset e-mail. */
export function useResetPassword(token: string) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const f = useFormSubmit('Could not reset the password')
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return f.fail('This reset link is missing its token')
    const problem = passwordProblem(password, confirm)
    if (problem) return f.fail(problem)
    return f.run(() =>
      api.post('/api/auth/reset-password', {
        token,
        password,
      }),
    )
  }
  return { password, setPassword, confirm, setConfirm, submit, ...f }
}
