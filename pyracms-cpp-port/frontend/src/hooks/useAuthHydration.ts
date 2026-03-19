'use client'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setCredentials, logout } from '@/store/slices/authSlice'
import api from '@/lib/api'

export function useAuthHydration() {
  const dispatch = useDispatch()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    api.get('/api/auth/me')
      .then(res => {
        dispatch(setCredentials({ user: res.data, token }))
      })
      .catch(() => {
        localStorage.removeItem('token')
        dispatch(logout())
      })
  }, [dispatch])
}
