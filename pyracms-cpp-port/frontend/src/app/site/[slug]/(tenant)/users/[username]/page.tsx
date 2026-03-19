'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  Container, Typography, Box, Avatar, Paper, Tabs, Tab, Chip, Skeleton,
} from '@mui/material'
import { PersonOutlined, StarOutlined } from '@mui/icons-material'
import api from '@/lib/api'
import PageTransition from '@/components/common/PageTransition'
import { AchievementGrid } from '@/components/users/AchievementGrid'
import { FollowButton } from '@/components/users/FollowButton'
import { FollowerList } from '@/components/users/FollowerList'
import { ActivityTimeline } from '@/components/users/ActivityTimeline'

interface UserProfile {
  id: number
  username: string
  email: string
  bio: string
  location: string
  avatarUrl: string
  reputation: number
  createdAt: string
}

export default function UserProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/api/users?username=${username}`)
        const userData = Array.isArray(res.data) ? res.data[0] : res.data
        if (userData) {
          setUser({
            id: userData.id,
            username: userData.username,
            email: userData.email || '',
            bio: userData.bio || '',
            location: userData.location || '',
            avatarUrl: userData.avatarUrl || userData.avatar_url || '',
            reputation: userData.reputation || 0,
            createdAt: userData.createdAt || userData.created_at || '',
          })
        }
      } catch { /* ignore */ }
      setLoading(false)
    }
    fetchUser()
  }, [username])

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Skeleton variant="circular" width={120} height={120} />
        <Skeleton variant="text" width={200} height={40} sx={{ mt: 2 }} />
      </Container>
    )
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4">User not found</Typography>
      </Container>
    )
  }

  return (
    <PageTransition>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper sx={{ p: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Avatar
              src={user.avatarUrl}
              sx={{ width: 120, height: 120, fontSize: 48 }}
            >
              {user.username[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h4" fontWeight={700}>{user.username}</Typography>
                <FollowButton userId={user.id} />
              </Box>
              {user.bio && (
                <Typography color="text.secondary" sx={{ mb: 1 }}>{user.bio}</Typography>
              )}
              <Box sx={{ display: 'flex', gap: 2 }}>
                {user.location && (
                  <Chip icon={<PersonOutlined />} label={user.location} size="small" variant="outlined" />
                )}
                <Chip icon={<StarOutlined />} label={`${user.reputation} reputation`} size="small" color="primary" />
              </Box>
            </Box>
          </Box>
        </Paper>

        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Activity" />
          <Tab label="Achievements" />
          <Tab label="Followers" />
          <Tab label="Following" />
        </Tabs>

        {activeTab === 0 && <ActivityTimeline userId={user.id} />}
        {activeTab === 1 && <AchievementGrid userId={user.id} />}
        {activeTab === 2 && <FollowerList userId={user.id} type="followers" />}
        {activeTab === 3 && <FollowerList userId={user.id} type="following" />}
      </Container>
    </PageTransition>
  )
}
