'use client'

import { useState, useEffect } from 'react'
import { Box, Card, CardContent, Typography, Tooltip } from '@mui/material'
import {
  StarOutlined, ForumOutlined, ArticleOutlined, CodeOutlined,
  RocketLaunchOutlined, BugReportOutlined, CalendarMonthOutlined,
  ThumbUpOutlined, EmojiEventsOutlined, WhatshotOutlined,
} from '@mui/icons-material'
import api from '@/lib/api'
import AnimatedList from '@/components/common/AnimatedList'

interface Achievement {
  id: number
  name: string
  displayName: string
  description: string
  icon: string
  earned: boolean
  earnedAt: string
}

const iconMap: Record<string, React.ReactNode> = {
  star: <StarOutlined />,
  forum: <ForumOutlined />,
  article: <ArticleOutlined />,
  code: <CodeOutlined />,
  rocket: <RocketLaunchOutlined />,
  bug: <BugReportOutlined />,
  calendar: <CalendarMonthOutlined />,
  thumbup: <ThumbUpOutlined />,
  hundred: <WhatshotOutlined />,
  default: <EmojiEventsOutlined />,
}

export function AchievementGrid({ userId }: { userId: number }) {
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await api.get(`/api/users/${userId}/achievements`)
        setAchievements(res.data || [])
      } catch { /* ignore */ }
    }
    fetchAchievements()
  }, [userId])

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
      <AnimatedList>
        {achievements.map((a) => (
          <Tooltip key={a.id} title={a.description}>
            <Card
              sx={{
                opacity: a.earned ? 1 : 0.4,
                border: a.earned ? '2px solid' : '1px solid',
                borderColor: a.earned ? 'primary.main' : 'divider',
                transition: 'all 0.2s',
                '&:hover': { transform: a.earned ? 'scale(1.02)' : undefined },
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box sx={{ fontSize: 40, color: a.earned ? 'primary.main' : 'text.disabled', mb: 1 }}>
                  {iconMap[a.icon] || iconMap.default}
                </Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  {a.displayName}
                </Typography>
                {a.earned && a.earnedAt && (
                  <Typography variant="caption" color="text.secondary">
                    Earned {new Date(a.earnedAt).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Tooltip>
        ))}
      </AnimatedList>
    </Box>
  )
}
