'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { setCredentials } from '@/store/slices/authSlice'
import api from '@/lib/api'
import type { RegisterRequest } from '@/types'

/** Minimal valid e-mail pattern used for registration validation. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validates a {@link RegisterRequest} and returns a human-readable
 * error string, or an empty string when the data is valid.
 *
 * Rules:
 * - `username`  — required, non-blank
 * - `email`     — required, must look like an e-mail address
 * - `password`  — required, minimum 8 characters
 *
 * @param data - The registration form values to validate.
 * @returns A validation error message, or `''` if valid.
 */
export function validateRegisterForm(data: RegisterRequest): string {
  if (!data.username.trim()) {
    return 'Username is required'
  }
  if (!data.email.trim()) {
    return 'Email is required'
  }
  if (!EMAIL_RE.test(data.email)) {
    return 'Invalid email address'
  }
  if (!data.password) {
    return 'Password is required'
  }
  if (data.password.length < 8) {
    return 'Password must be at least 8 characters'
  }
  if (
    data.confirmPassword !== undefined &&
    data.password !== data.confirmPassword
  ) {
    return 'Passwords do not match'
  }
  return ''
}

/**
 * Manages registration form state, field updates, client-side
 * validation, server submission, and post-registration navigation.
 *
 * @param redirectTo - Path to navigate to on successful registration.
 *   Defaults to `'/'`.
 */
export function useRegister(redirectTo = '/') {
  const router = useRouter()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const updateField = (
    field: keyof RegisterRequest,
    value: string,
  ) => {
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
    const { confirmPassword: _cp, ...payload } = formData

    try {
      const response = await api.post(
        '/api/auth/register',
        payload,
      )
      const { token, user } = response.data

      if (token) {
        localStorage.setItem('token', token)
        dispatch(setCredentials({ user, token }))
        router.push(redirectTo)
      } else {
        setError(response.data.error || 'Registration failed')
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as {
          response: { data?: { error?: string } }
        }
        setError(
          axiosErr.response?.data?.error || 'Registration failed',
        )
      } else {
        setError('Unable to connect to server')
      }
    } finally {
      setLoading(false)
    }
  }

  return { formData, updateField, error, loading, handleSubmit }
}
