import { Button } from '@mui/material'
import {
  PlayArrow, DownloadOutlined, UpdateOutlined,
} from '@mui/icons-material'
import type { ActionLabel } from './gameActionState'

interface Props {
  label: ActionLabel
  disabled: boolean
  onClick: () => void
}

const ICONS = {
  Install: DownloadOutlined, Update: UpdateOutlined, Play: PlayArrow,
}

/** Install / Update / Play button; blue when an update is available. */
export default function PrimaryActionButton(
  { label, disabled, onClick }: Props,
) {
  const Icon = ICONS[label]
  const update = label === 'Update'
  return (
    <Button
      variant="contained" size="large" startIcon={<Icon />}
      onClick={onClick} disabled={disabled}
      data-testid="primary-action"
      sx={{
        px: 5, bgcolor: update ? '#1a9fff' : '#5ba32b',
        '&:hover': { bgcolor: update ? '#1387e0' : '#4a8a22' },
      }}
    >
      {label}
    </Button>
  )
}
