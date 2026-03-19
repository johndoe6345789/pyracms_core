'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { setCredentials } from '@/store/slices/authSlice'
import api from '@/lib/api'
import type { LoginRequest } from '@/types'

/**
 * Validates a {@link LoginRequest} and returns a human-readable
 * error string, or an empty string when the data is valid.
 *
 * @param data - The login form values to validate.
 * @returns A validation error message, or `''` if valid.
 */
export function validateLoginForm(data: LoginRequest): string {
  if (!data.username.trim()) {
    return 'Username is required'
  }
  if (!data.password) {
    return 'Password is required'
  }
  return ''
}

/**
 * Manages login form state, field updates, client-side validation,
 * server submission, and post-login navigation.
 *
 * @param redirectTo - Path to navigate to on successful login.
 *   Defaults to `'/'`.
 */
export function useLogin(redirectTo = '/') {
  const router = useRouter()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const updateField = (
    field: keyof LoginRequest,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateLoginForm(formData)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await api.post('/api/auth/login', formData)
      const { token, user } = response.data

      if (token) {
        localStorage.setItem('token', token)
        dispatch(setCredentials({ user, token }))
        router.push(redirectTo)
      } else {
        setError(response.data.error || 'Login failed')
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as {
          response: { data?: { error?: string } }
        }
        setError(axiosErr.response?.data?.error || 'Login failed')
      } else {
        setError('Unable to connect to server')
      }
    } finally {
      setLoading(false)
    }
  }

  return { formData, updateField, error, loading, handleSubmit }
}
