'use client'

import { Typography, Box, Chip } from '@mui/material'
import Link from 'next/link'
import { langColor } from '@/lib/snippets'

interface Props {
  id: string
  title: string
  language: string
  href: string
}

export function SnippetCardTitle({ id, title, language, href }: Props) {
  const color = langColor(language)
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 1,
      }}
    >
      <Typography
        variant="subtitle1"
        component={Link}
        href={href}
        data-testid={`snippet-link-${id}`}
        sx={{
          fontWeight: 600,
          textDecoration: 'none',
          color: 'text.primary',
          '&:hover': { color: 'primary.main' },
        }}
      >
        {title}
      </Typography>
      <Chip
        label={language}
        size="small"
        sx={{
          bgcolor: color + '20',
          color,
          fontWeight: 600,
          fontSize: '0.7rem',
          height: 22,
        }}
      />
    </Box>
  )
}
