'use client'

import { useState, useEffect } from 'react'
import { Button } from '@mui/material'
import {
  PersonAddOutlined, PersonRemoveOutlined,
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import api from '@/lib/api'
import { apiErrorMessage } from '@/lib/apiError'
import { ErrorAlert } from '@/components/common/ErrorAlert'

export function FollowButton({ userId }: { userId: number }) {
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isAuth = useSelector((s: RootState) => s.auth.isAuthenticated)
  const me = useSelector((s: RootState) => s.auth.user?.id)

  useEffect(() => {
    if (!isAuth || me === userId) return
    // Check if already following (heuristic: check followers list)
    const check = async () => {
      try {
        const res = await api.get(
          `/api/users/${userId}/followers?limit=100`)
        const list = res.data?.items || []
        setFollowing(list.some(
          (f: { userId: number }) => f.userId === me))
      } catch { /* ignore */ }
    }
    check()
  }, [isAuth, userId, me])

  if (!isAuth || me === userId) return null

  const handleToggle = async () => {
    setLoading(true)
    setError('')
    try {
      if (following) await api.delete(`/api/users/${userId}/follow`)
      else await api.post(`/api/users/${userId}/follow`)
      setFollowing(!following)
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not update follow'))
    }
    setLoading(false)
  }

  return (<>
    <Button
      variant={following ? 'outlined' : 'contained'}
      size="small" onClick={handleToggle} disabled={loading}
      startIcon={following
        ? <PersonRemoveOutlined /> : <PersonAddOutlined />}
    >
      {following ? 'Unfollow' : 'Follow'}
    </Button>
    <ErrorAlert error={error} testId="follow-error" mb={0} />
  </>)
}
