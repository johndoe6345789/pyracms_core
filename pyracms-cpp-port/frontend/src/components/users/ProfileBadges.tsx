import { Box, Typography, Chip, Divider } from '@mui/material'

export interface ProfileBadge {
  label: string
  color: string
}

export function ProfileBadges({ badges }: { badges: ProfileBadge[] }) {
  if (badges.length === 0) return null
  return (
    <>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle2" gutterBottom>
        Badges
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {badges.map((b) => (
          <Chip
            key={b.label}
            label={b.label}
            size="small"
            sx={{
              bgcolor: b.color + '20',
              color: b.color,
              fontWeight: 600,
            }}
          />
        ))}
      </Box>
    </>
  )
}
