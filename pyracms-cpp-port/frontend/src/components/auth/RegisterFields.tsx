'use client'

import { TextField, Box, Typography, LinearProgress } from '@mui/material'
import type { RegisterRequest } from '@/types'

interface Props {
  formData: RegisterRequest
  updateField: (
    field: keyof RegisterRequest,
    value: string,
  ) => void
  errorId?: string
}

/** Password strength score: 0 (empty) … 4 (very strong). */
export type StrengthScore = 0 | 1 | 2 | 3 | 4

const STRENGTH_LABELS: Record<StrengthScore, string> = {
  0: '',
  1: 'Weak',
  2: 'Fair',
  3: 'Good',
  4: 'Strong',
}

const STRENGTH_COLOURS: Record<StrengthScore, string> = {
  0: 'transparent',
  1: '#d32f2f',
  2: '#f57c00',
  3: '#388e3c',
  4: '#1b5e20',
}

/**
 * Returns a password strength score from 0–4.
 *
 * Scoring criteria (each worth 1 point):
 * - Length ≥ 8
 * - Contains a digit
 * - Contains a lowercase letter
 * - Contains an uppercase letter or special character
 *
 * @param password - Raw password string to evaluate.
 * @returns Strength score between 0 and 4 inclusive.
 */
export function passwordStrength(password: string): StrengthScore {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score += 1
  if (/\d/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z!@#$%^&*]/.test(password)) score += 1
  return score as StrengthScore
}

interface StrengthBarProps {
  password: string
}

/**
 * Visual password-strength indicator rendered below the password field.
 * Uses a coloured progress bar and a text label.
 */
function PasswordStrengthBar({ password }: StrengthBarProps) {
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

/**
 * All input fields for the registration form.
 * Extracted to keep RegisterForm under 100 LOC.
 */
export default function RegisterFields({
  formData,
  updateField,
  errorId,
}: Props) {
  return (
    <>
      <TextField
        fullWidth
        label="Username"
        margin="normal"
        required
        value={formData.username}
        onChange={(e) =>
          updateField('username', e.target.value)
        }
        inputProps={{
          'data-testid': 'register-username-input',
          'aria-label': 'Username',
        }}
        aria-describedby={errorId}
      />
      <TextField
        fullWidth
        label="Email"
        type="email"
        margin="normal"
        required
        value={formData.email}
        onChange={(e) =>
          updateField('email', e.target.value)
        }
        inputProps={{
          'data-testid': 'register-email-input',
          'aria-label': 'Email address',
        }}
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        margin="normal"
        required
        value={formData.password}
        onChange={(e) =>
          updateField('password', e.target.value)
        }
        inputProps={{
          'data-testid': 'register-password-input',
          'aria-label': 'Password',
        }}
      />
      <PasswordStrengthBar password={formData.password} />
      <TextField
        fullWidth
        label="Confirm Password"
        type="password"
        margin="normal"
        required
        value={formData.confirmPassword ?? ''}
        onChange={(e) =>
          updateField('confirmPassword', e.target.value)
        }
        inputProps={{
          'data-testid': 'register-confirm-password-input',
          'aria-label': 'Confirm password',
        }}
      />
      <TextField
        fullWidth
        label="First Name"
        margin="normal"
        value={formData.firstName}
        onChange={(e) =>
          updateField('firstName', e.target.value)
        }
        inputProps={{
          'data-testid': 'register-firstname-input',
          'aria-label': 'First name',
        }}
      />
      <TextField
        fullWidth
        label="Last Name"
        margin="normal"
        value={formData.lastName}
        onChange={(e) =>
          updateField('lastName', e.target.value)
        }
        inputProps={{
          'data-testid': 'register-lastname-input',
          'aria-label': 'Last name',
        }}
      />
    </>
  )
}
