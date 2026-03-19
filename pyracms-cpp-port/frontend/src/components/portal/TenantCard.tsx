'use client'

import { Card, CardContent, CardActionArea, Typography, Box, Chip } from '@mui/material'
import { LanguageOutlined, PersonOutline } from '@mui/icons-material'
import Link from 'next/link'
import type { Site } from '@/hooks/useTenantList'

interface TenantCardProps {
  site: Site
}

export default function TenantCard({ site }: TenantCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 3,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardActionArea
        component={Link}
        href={`/site/${site.slug}`}
        sx={{ height: '100%', display: 'flex', alignItems: 'flex-start' }}
      >
        <CardContent sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LanguageOutlined sx={{ color: 'primary.main', fontSize: 22 }} />
            <Typography variant="h5" component="h3">
              {site.name}
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {site.description}
          </Typography>
          <Chip
            icon={<PersonOutline />}
            label={site.owner}
            size="small"
            variant="outlined"
            sx={{ borderColor: 'divider' }}
          />
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
