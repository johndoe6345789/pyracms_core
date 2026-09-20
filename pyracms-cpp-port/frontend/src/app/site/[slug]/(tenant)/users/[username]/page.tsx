'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { Container, Typography, Tabs, Tab, Skeleton } from '@mui/material'
import PageTransition from '@/components/common/PageTransition'
import { AchievementGrid } from '@/components/users/AchievementGrid'
import { FollowerList } from '@/components/users/FollowerList'
import { ActivityTimeline } from '@/components/users/ActivityTimeline'
import { UserHeader } from '@/components/users/UserHeader'
import { useUserProfile } from '@/components/users/useUserProfile'

export default function UserProfilePage() {
  const params = useParams()
  const username = params.username as string
  const { user, loading } = useUserProfile(username)
  const [activeTab, setActiveTab] = useState(0)

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
        <Skeleton variant="circular" width={120} height={120} />
        <Skeleton variant="text" width={200} height={40} sx={{ mt: 2 }} />
      </Container>
    )
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
        <Typography variant="h4">User not found</Typography>
      </Container>
    )
  }

  return (
    <PageTransition>
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
        <UserHeader user={user} />
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
