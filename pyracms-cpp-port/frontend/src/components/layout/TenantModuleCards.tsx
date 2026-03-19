'use client'

import { Card, CardContent, CardActionArea, Typography, Box, Grid } from '@mui/material'
import Link from 'next/link'
import {
  ArticleOutlined, ForumOutlined, PhotoLibraryOutlined, SportsEsportsOutlined,
} from '@mui/icons-material'

const MODULES = [
  { key: 'articles', label: 'Articles', description: 'Read and publish articles, tutorials, and blog posts.', icon: ArticleOutlined, color: '#6366f1' },
  { key: 'forum', label: 'Forum', description: 'Join discussions, ask questions, and share knowledge.', icon: ForumOutlined, color: '#ec4899' },
  { key: 'gallery', label: 'Gallery', description: 'Browse image galleries and upload your own photos.', icon: PhotoLibraryOutlined, color: '#10b981' },
  { key: 'games', label: 'Games', description: 'Play browser games, view leaderboards, and compete.', icon: SportsEsportsOutlined, color: '#f59e0b' },
]

interface TenantModuleCardsProps {
  slug: string
}

export default function TenantModuleCards({ slug }: TenantModuleCardsProps) {
  return (
    <Grid container spacing={3}>
      {MODULES.map((mod) => {
        const Icon = mod.icon
        return (
          <Grid item xs={12} sm={6} key={mod.key}>
            <Card variant="outlined" sx={{
              height: '100%', borderColor: 'divider', transition: 'all 0.2s ease-in-out',
              '&:hover': { borderColor: mod.color, boxShadow: 3, transform: 'translateY(-4px)' },
            }}>
              <CardActionArea component={Link} href={`/site/${slug}/${mod.key}`} sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', bgcolor: `${mod.color}14` }}>
                      <Icon sx={{ color: mod.color, fontSize: 26 }} />
                    </Box>
                    <Typography variant="h4" component="h2">{mod.label}</Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary">{mod.description}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        )
      })}
    </Grid>
  )
}
