'use client'

import { TextField } from '@mui/material'
import type { RegisterRequest } from '@/types'

interface Props {
  formData: RegisterRequest
  updateField: (
    field: keyof RegisterRequest,
    value: string,
  ) => void
  errorId?: string
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
