'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { setCredentials } from '@/store/slices/authSlice'
import api from '@/lib/api'
import type { LoginRequest } from '@/types'

export function validateLoginForm(data: LoginRequest): string {
  if (!data.username.trim()) return 'Username is required'
  if (!data.password) return 'Password is required'
  return ''
}

export function useLogin(redirectTo = '/') {
  const router = useRouter()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const updateField = (field: keyof LoginRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const loginDirect = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    setError('')
    setLoading(true)
    try {
      const response = await api.post('/api/auth/login', { username, password })
      const { token, user } = response.data
      if (token) {
        localStorage.setItem('token', token)
        dispatch(setCredentials({ user, token }))
        return true
      }
      setError(response.data.error || 'Login failed')
      return false
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response: { data?: { error?: string } } }
        setError(axiosErr.response?.data?.error || 'Login failed')
      } else {
        setError('Unable to connect to server')
      }
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validateLoginForm(formData)
    if (validationError) { setError(validationError); return }
    const ok = await loginDirect(formData.username.trim(), formData.password)
    if (ok) router.push(redirectTo)
  }

  return { formData, updateField, error, loading, handleSubmit, loginDirect }
}
