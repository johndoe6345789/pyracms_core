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

const EMPTY: RegisterRequest = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
}

/** First-run setup: creates the Platform Owner and signs them in. */
export function useSetup() {
  const router = useRouter()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState<RegisterRequest>(EMPTY)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const updateField = (field: keyof RegisterRequest, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const problem = validateRegisterForm(formData)
    if (problem) return setError(problem)
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/api/auth/setup', {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      })
      setToken(null, res.data.token)
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }))
      router.push('/')
    } catch (err: unknown) {
      setError(apiErrorMessage(err, 'Setup failed'))
    } finally {
      setLoading(false)
    }
  }

  return { formData, updateField, error, loading, handleSubmit }
}
