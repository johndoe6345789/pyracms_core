import { Box, Card, CardContent, Switch, Typography } from '@mui/material'
import { Feature } from '@/hooks/useFeatureToggles'

interface FeatureToggleCardProps {
  feature: Feature
  onToggle: (id: string) => void
}

export default function FeatureToggleCard({ feature, onToggle }: FeatureToggleCardProps) {
  return (
    <Card variant="outlined" sx={{ borderColor: 'divider' }}>
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5">{feature.name}</Typography>
          <Typography variant="body1" color="text.secondary">
            {feature.description}
          </Typography>
        </Box>
        <Switch
          checked={feature.enabled}
          onChange={() => onToggle(feature.id)}
          color="primary"
        />
      </CardContent>
    </Card>
  )
}
