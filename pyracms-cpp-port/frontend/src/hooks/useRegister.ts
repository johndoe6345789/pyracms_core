'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { setCredentials } from '@/store/slices/authSlice'
import api from '@/lib/api'
import type { RegisterRequest } from '@/types'

export function useRegister(redirectTo = '/') {
  const router = useRouter()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const updateField = (field: keyof RegisterRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/api/auth/register', formData)
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
        const resp = (err as { response: { data?: { error?: string } } }).response
        setError(resp?.data?.error || 'Registration failed')
      } else {
        setError('Unable to connect to server')
      }
    } finally {
      setLoading(false)
    }
  }

  return { formData, updateField, error, loading, handleSubmit }
}
