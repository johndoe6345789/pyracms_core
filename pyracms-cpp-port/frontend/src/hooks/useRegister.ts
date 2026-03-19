'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import type { RegisterRequest, AuthResponse } from '@/types'

export function useRegister() {
  const router = useRouter()
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
      const response = await api.post<AuthResponse>('/api/auth/register', formData)

      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token)
        router.push('/dashboard')
      } else {
        setError(response.data.error || 'Registration failed')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  return { formData, updateField, error, loading, handleSubmit }
}
