'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { setCredentials } from '@/store/slices/authSlice'
import api from '@/lib/api'
import { setToken } from '@/lib/session'
import { validateRegisterForm } from '@/hooks/registerValidation'
import { apiErrorMessage } from '@/lib/apiError'
import type { RegisterRequest } from '@/types'

export { validateRegisterForm } from '@/hooks/registerValidation'

const EMPTY: RegisterRequest = {
  username: '', email: '', password: '', confirmPassword: '',
  firstName: '', lastName: '',
}

/**
 * Registration form state, validation, submission and navigation.
 *
 * @param redirectTo - Path to navigate to on success (default `'/'`).
 * @param tenant - Site slug to create the account on (accounts are
 *   scoped per site). Omit for a platform account.
 */
export function useRegister(redirectTo = '/', tenant?: string) {
  const router = useRouter()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState<RegisterRequest>(EMPTY)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const updateField = (field: keyof RegisterRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validateRegisterForm(formData)
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setLoading(true)

    // Strip confirmPassword — the API does not expect it.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword: _cp, ...rest } = formData
    const payload = {
      ...rest,
      username: rest.username.trim(),
      email: rest.email.trim(),
      ...(tenant ? { tenant } : {}),
    }

    try {
      const response = await api.post('/api/auth/register', payload)
      const { token, user } = response.data
      if (token) {
        setToken(tenant ?? null, token)
        dispatch(setCredentials({ user, token }))
        router.push(redirectTo)
      } else {
        setError(response.data.error || 'Registration failed')
      }
    } catch (err: unknown) {
      setError(apiErrorMessage(err, 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  return { formData, updateField, error, loading, handleSubmit }
}
