'use client'

import { useState } from 'react'
import {
  TextField, InputAdornment, IconButton,
} from '@mui/material'
import {
  Visibility, VisibilityOff,
} from '@mui/icons-material'

interface PasswordFieldProps {
  value: string
  onChange: (value: string) => void
  label?: string
  sx?: object
  'data-testid'?: string
}

export default function PasswordField({
  value,
  onChange,
  label = 'Password',
  sx,
  'data-testid': testId,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] =
    useState(false)

  const toggleLabel = showPassword
    ? 'Hide password'
    : 'Show password'

  return (
    <TextField
      fullWidth
      label={label}
      type={showPassword ? 'text' : 'password'}
      margin="normal"
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputProps={{
        'data-testid': testId || 'password-input',
        'aria-label': label,
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() =>
                setShowPassword(!showPassword)
              }
              edge="end"
              aria-label={toggleLabel}
              data-testid="toggle-password"
            >
              {showPassword
                ? <VisibilityOff />
                : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={sx}
    />
  )
}
