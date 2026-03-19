'use client'

import { useState, useEffect } from 'react'
import { Button } from '@mui/material'
import { PersonAddOutlined, PersonRemoveOutlined } from '@mui/icons-material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import api from '@/lib/api'

interface FollowButtonProps {
  userId: number
}

export function FollowButton({ userId }: FollowButtonProps) {
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id)

  useEffect(() => {
    if (!isAuthenticated || currentUserId === userId) return
    // Check if already following (heuristic: check followers list)
    const checkFollowing = async () => {
      try {
        const res = await api.get(`/api/users/${userId}/followers?limit=100`)
        const followers = res.data?.items || []
        setFollowing(followers.some((f: { userId: number }) => f.userId === currentUserId))
      } catch { /* ignore */ }
    }
    checkFollowing()
  }, [isAuthenticated, userId, currentUserId])

  if (!isAuthenticated || currentUserId === userId) return null

  const handleToggle = async () => {
    setLoading(true)
    try {
      if (following) {
        await api.delete(`/api/users/${userId}/follow`)
      } else {
        await api.post(`/api/users/${userId}/follow`)
      }
      setFollowing(!following)
    } catch { /* ignore */ }
    setLoading(false)
  }

  return (
    <Button
      variant={following ? 'outlined' : 'contained'}
      size="small"
      onClick={handleToggle}
      disabled={loading}
      startIcon={following ? <PersonRemoveOutlined /> : <PersonAddOutlined />}
    >
      {following ? 'Unfollow' : 'Follow'}
    </Button>
  )
}
