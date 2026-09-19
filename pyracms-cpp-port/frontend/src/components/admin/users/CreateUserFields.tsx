import { TextField } from '@mui/material'
import type { CreateUserState } from './useCreateUser'

export default function CreateUserFields({
  s,
}: {
  s: CreateUserState
}) {
  return (
    <>
      <TextField
        label="Username"
        value={s.username}
        onChange={(e) => s.setUsername(e.target.value)}
        required
        size="small"
        data-testid="new-username-input"
      />
      <TextField
        label="Email"
        type="email"
        value={s.email}
        onChange={(e) => s.setEmail(e.target.value)}
        required
        size="small"
        data-testid="new-email-input"
      />
      <TextField
        label="Full Name"
        value={s.fullName}
        onChange={(e) => s.setFullName(e.target.value)}
        size="small"
        data-testid="new-fullname-input"
      />
      <TextField
        label="Password"
        type="password"
        value={s.password}
        onChange={(e) => s.setPassword(e.target.value)}
        required
        size="small"
        data-testid="new-password-input"
      />
    </>
  )
}
