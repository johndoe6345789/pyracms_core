'use client'

import {
  Card, CardContent, Typography,
  Box, Button,
} from '@mui/material'
import Link from 'next/link'
import type { ReactNode } from 'react'

interface Props {
  label: string
  description: string
  icon: ReactNode
  href: string
  testId: string
}

export default function SuperAdminQuickCard({
  label,
  description,
  icon,
  href,
  testId,
}: Props) {
  return (
    <Card variant="outlined" data-testid={testId}>
      <CardContent>
        <Box
          sx={{ color: 'warning.main', mb: 1 }}
          aria-hidden="true"
        >
          {icon}
        </Box>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, mb: 0.5 }}
        >
          {label}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {description}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          component={Link}
          href={href}
          aria-label={label}
        >
          Open
        </Button>
      </CardContent>
    </Card>
  )
}
