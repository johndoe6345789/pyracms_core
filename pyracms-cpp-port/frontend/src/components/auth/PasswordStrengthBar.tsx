import { Box, Typography, LinearProgress } from '@mui/material'
import {
  passwordStrength,
  STRENGTH_LABELS,
  STRENGTH_COLOURS,
} from './passwordStrength'

interface StrengthBarProps {
  password: string
}

/**
 * Visual password-strength indicator rendered below the password field.
 * Uses a coloured progress bar and a text label.
 */
export default function PasswordStrengthBar({ password }: StrengthBarProps) {
  const score = passwordStrength(password)
  const label = STRENGTH_LABELS[score]
  const colour = STRENGTH_COLOURS[score]

  if (!password) return null

  return (
    <Box
      data-testid="password-strength"
      aria-label={`Password strength: ${label || 'none'}`}
      role="status"
      aria-live="polite"
      sx={{ mt: 0.5 }}
    >
      <LinearProgress
        variant="determinate"
        value={(score / 4) * 100}
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: colour,
          },
        }}
      />
      {label ? (
        <Typography
          variant="caption"
          data-testid="password-strength-label"
          sx={{ color: colour }}
        >
          {label}
        </Typography>
      ) : null}
    </Box>
  )
}
