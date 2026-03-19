'use client'

import { useState } from 'react'
import { TextField, InputAdornment, IconButton } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'

interface PasswordFieldProps {
  value: string
  onChange: (value: string) => void
  label?: string
  sx?: object
}

export default function PasswordField({ value, onChange, label = 'Password', sx }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <TextField
      fullWidth
      label={label}
      type={showPassword ? 'text' : 'password'}
      margin="normal"
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={sx}
    />
  )
}
