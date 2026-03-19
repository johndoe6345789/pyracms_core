'use client'

import { Button } from '@mui/material'
import { ArrowBackOutlined } from '@mui/icons-material'
import Link from 'next/link'

interface BackButtonProps {
  href: string
  label: string
}

export function BackButton({ href, label }: BackButtonProps) {
  return (
    <Button component={Link} href={href} startIcon={<ArrowBackOutlined />} sx={{ color: 'text.secondary' }}>
      {label}
    </Button>
  )
}
