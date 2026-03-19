import { ReactNode } from 'react'
import { Box, Card, CardContent, Typography } from '@mui/material'

interface StatCardProps {
  label: string
  value: number
  icon: ReactNode
  color: string
}

export default function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <Card variant="outlined" sx={{ borderColor: 'divider' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}14`,
            color,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h3" component="div" sx={{ lineHeight: 1.2 }}>
            {value}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
