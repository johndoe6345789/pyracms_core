'use client'

import {
  Button, Typography, Box, Alert,
} from '@mui/material'
import Link from 'next/link'
import { useRegister } from '@/hooks/useRegister'
import RegisterFields from './RegisterFields'
import AuthScopeNotice from './AuthScopeNotice'

interface Props {
  redirectTo?: string | undefined
  /** Site slug: create the account on that site only */
  tenant?: string | undefined
}

/** Registration form. Pass redirectTo to override post-register destination. */
export default function RegisterForm({ redirectTo, tenant }: Props) {
  const {
    formData, updateField,
    error, loading, handleSubmit,
  } = useRegister(redirectTo, tenant)

  return (
    <>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
      >
        Register
      </Typography>

      {tenant && (
        <AuthScopeNotice
          tenant={tenant}
          platformHref="/auth/register"
        />
      )}

      {error && (
        <Alert
          severity="error"
          role="alert"
          id="register-error-msg"
          data-testid="register-error"
          aria-live="assertive"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      <form
        onSubmit={handleSubmit}
        data-testid="register-form"
        aria-label="Registration form"
      >
        <RegisterFields
          formData={formData}
          updateField={updateField}
          errorId={error ? 'register-error-msg' : undefined}
        />
        <Button
          fullWidth
          variant="contained"
          type="submit"
          disabled={loading}
          data-testid="register-submit"
          aria-label={
            loading ? 'Registering' : 'Register'
          }
          sx={{ mt: 3, mb: 2 }}
        >
          {loading ? 'Registering...' : 'Register'}
        </Button>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link
              href={
                tenant
                  ? `/auth/login?tenant=${encodeURIComponent(tenant)}`
                  : '/auth/login'
              }
              data-testid="login-link"
              aria-label="Go to login page"
              style={{ color: '#1976d2' }}
            >
              Login
            </Link>
          </Typography>
        </Box>
      </form>
    </>
  )
}
