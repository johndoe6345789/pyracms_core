'use client'

import NextLink from 'next/link'
import { Paper, Typography, Box } from '@mui/material'

const actions = (slug: string) => [
  { label: 'Create New Content', href: `/site/${slug}/articles/create` },
  { label: 'Manage Users', href: `/site/${slug}/admin/users` },
  { label: 'View Analytics', href: `/site/${slug}/admin/analytics` },
  { label: 'Feature Settings', href: `/site/${slug}/admin/features` },
]

export default function QuickActions({ slug }: { slug: string }) {
  return (
    <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }} data-testid="quick-actions">
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
        Quick Actions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Common tasks
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {actions(slug).map((a) => (
          <Box
            key={a.href}
            component={NextLink}
            href={a.href}
            data-testid={`quick-action-${a.label}`}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.default',
              color: 'text.primary',
              textDecoration: 'none',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'white',
                transform: 'translateX(4px)',
              },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {a.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  )
}
