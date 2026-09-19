'use client'

import { Button } from '@mui/material'
import { ArrowBackOutlined } from '@mui/icons-material'
import Link from 'next/link'

interface BackButtonProps {
  href: string
  label: string
  'data-testid'?: string
}

export function BackButton({
  href, label, 'data-testid': testId,
}: BackButtonProps) {
  return (
    <Button
      component={Link}
      href={href}
      data-testid={testId}
      startIcon={<ArrowBackOutlined />}
      sx={{ color: 'text.secondary' }}
    >
      {label}
    </Button>
  )
}
