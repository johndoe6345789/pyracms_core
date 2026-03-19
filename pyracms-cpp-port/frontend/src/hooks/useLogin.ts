'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import type { LoginRequest, AuthResponse } from '@/types'

export function useLogin() {
  const router = useRouter()
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const updateField = (field: keyof LoginRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post<AuthResponse>('/api/auth/login', formData)

      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token)
        router.push('/dashboard')
      } else {
        setError(response.data.error || 'Login failed')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return { formData, updateField, error, loading, handleSubmit }
}
