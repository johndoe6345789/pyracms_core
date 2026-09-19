'use client'

import { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import api from '@/lib/api'
import AnimatedList from '@/components/common/AnimatedList'
import { AchievementCard } from './AchievementCard'
import type { Achievement } from './achievementIcons'

export function AchievementGrid({ userId }: { userId: number }) {
  const [items, setItems] = useState<Achievement[]>([])
  useEffect(() => {
    ;(async () => {
      try {
        const res = await api.get(`/api/users/${userId}/achievements`)
        setItems(res.data || [])
      } catch {
        /* ignore */
      }
    })()
  }, [userId])
  return (
    <Box
      data-testid="achievement-grid"
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      }}
    >
      <AnimatedList>
        {items.map((a) => (
          <AchievementCard key={a.id} a={a} />
        ))}
      </AnimatedList>
    </Box>
  )
}
