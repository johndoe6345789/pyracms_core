'use client'

import { TextField } from '@mui/material'
import PasswordField from './PasswordField'
import LoginHeader from './LoginHeader'
import LoginActions from './LoginActions'
import LoginFooter from './LoginFooter'
import TurboErrorDialog from './TurboErrorDialog'
import { useLogin } from '@/hooks/useLogin'
import { useTurboLogin } from '@/hooks/useTurboLogin'

interface Props {
  redirectTo?: string | undefined
  /** Site slug: sign in to that site's own accounts */
  tenant?: string | undefined
}

export default function LoginForm({ redirectTo, tenant }: Props) {
  const { formData, updateField, error, loading, handleSubmit, loginDirect } =
    useLogin(redirectTo, tenant)
  const { turboError, handleTurboLogin, clearTurboError } = useTurboLogin(
    loginDirect,
    redirectTo,
  )

  return (
    <>
      <TurboErrorDialog
        open={!!turboError}
        message={turboError ?? ''}
        onClose={clearTurboError}
      />
      <LoginHeader error={error} tenant={tenant} />
      <form
        onSubmit={handleSubmit}
        data-testid="login-form"
        aria-label="Login form"
      >
        <TextField
          fullWidth
          label="Username"
          margin="normal"
          required
          value={formData.username}
          onChange={(e) => updateField('username', e.target.value)}
          inputProps={{
            'data-testid': 'username-input',
            'aria-label': 'Username',
          }}
          aria-describedby={error ? 'login-error-msg' : undefined}
          sx={{ mb: 2 }}
        />
        <PasswordField
          value={formData.password}
          onChange={(val) => updateField('password', val)}
          data-testid="password-input"
          sx={{ mb: 3 }}
        />
        <LoginActions
          loading={loading}
          onTurbo={handleTurboLogin}
          tenant={tenant}
        />
      </form>
      <LoginFooter tenant={tenant} />
    </>
  )
}
