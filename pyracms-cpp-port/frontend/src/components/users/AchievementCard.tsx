import { Box, Card, CardContent, Typography, Tooltip } from '@mui/material'
import { ico, type Achievement } from './achievementIcons'

export function AchievementCard({ a }: { a: Achievement }) {
  return (
    <Tooltip title={a.description}>
      <Card
        data-testid={`achievement-${a.name}`}
        sx={{
          opacity: a.earned ? 1 : 0.4,
          border: a.earned ? '2px solid' : '1px solid',
          borderColor: a.earned ? 'primary.main' : 'divider',
          transition: 'all 0.2s',
          '&:hover': { transform: a.earned ? 'scale(1.02)' : undefined },
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <Box
            sx={{
              fontSize: 40,
              mb: 1,
              color: a.earned ? 'primary.main' : 'text.disabled',
            }}
          >
            {ico[a.icon] || ico.default}
          </Box>
          <Typography variant="subtitle2" fontWeight={700}>
            {a.displayName}
          </Typography>
          {a.earned && a.earnedAt && (
            <Typography variant="caption" color="text.secondary">
              {new Date(a.earnedAt).toLocaleDateString()}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Tooltip>
  )
}
