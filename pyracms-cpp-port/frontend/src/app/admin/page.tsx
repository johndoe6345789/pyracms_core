'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography, CircularProgress } from '@mui/material'
import api from '@/lib/api'

export default function AdminRedirectPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/tenants')
      .then(res => {
        const tenants = res.data || []
        if (tenants.length > 0) {
          router.replace(`/site/${tenants[0].slug}/admin`)
        } else {
          setError('No tenants found. Create a tenant first.')
        }
      })
      .catch(() => setError('Failed to load tenants'))
  }, [router])

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      {error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <CircularProgress />
      )}
    </Box>
  )
}
