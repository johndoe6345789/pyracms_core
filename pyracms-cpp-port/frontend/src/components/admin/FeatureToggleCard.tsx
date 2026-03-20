import {
  Box,
  Card,
  CardContent,
  Switch,
  Typography,
} from '@mui/material'
import {
  Feature,
} from '@/hooks/useFeatureToggles'

interface FeatureToggleCardProps {
  feature: Feature
  onToggle: (id: string) => void
}

export default function FeatureToggleCard({
  feature,
  onToggle,
}: FeatureToggleCardProps) {
  const switchId =
    `feature-switch-${feature.id}`

  return (
    <Card
      variant="outlined"
      sx={{ borderColor: 'divider' }}
      data-testid={
        `feature-card-${feature.id}`
      }
    >
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h5"
            id={switchId}
          >
            {feature.name}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
          >
            {feature.description}
          </Typography>
        </Box>
        <Switch
          checked={feature.enabled}
          onChange={
            () => onToggle(feature.id)
          }
          color="primary"
          inputProps={{
            'aria-labelledby':
              switchId,
          }}
          data-testid={
            `feature-toggle-` +
            feature.id
          }
        />
      </CardContent>
    </Card>
  )
}
