import { ReactNode } from 'react'
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from '@mui/material'
import Link from 'next/link'

interface QuickLinkCardProps {
  label: string
  description: string
  icon: ReactNode
  href: string
}

export default function QuickLinkCard({
  label,
  description,
  icon,
  href,
}: QuickLinkCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: 'divider',
        transition:
          'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 3,
          transform:
            'translateY(-4px)',
        },
      }}
      data-testid={
        `quick-link-${label.toLowerCase().replace(/\s+/g, '-')}`
      }
    >
      <CardActionArea
        component={Link}
        href={href}
        aria-label={
          `${label}: ${description}`
        }
      >
        <CardContent sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
          <Box
            sx={{
              color: 'primary.main',
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h5">
              {label}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
            >
              {description}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
