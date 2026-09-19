'use client'

import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material'
import { useProfileEdit, type ProfileFields } from '@/hooks/useProfileEdit'

const FIELDS: [keyof ProfileFields, string][] = [
  ['fullName', 'Full name'], ['email', 'Email'],
  ['website', 'Website'], ['timezone', 'Timezone'],
]

export default function ProfileEditForm({ userId }: { userId: number }) {
  const s = useProfileEdit(userId)
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box component="form" onSubmit={s.submit} data-testid="profile-form">
        <Typography variant="h6" component="h2" gutterBottom>
          Profile
        </Typography>
        {s.error && (
          <Alert severity="error" sx={{ mb: 2 }} data-testid="profile-error">
            {s.error}
          </Alert>
        )}
        {s.done && (
          <Alert severity="success" sx={{ mb: 2 }} data-testid="profile-done">
            Profile saved.
          </Alert>
        )}
        {FIELDS.map(([key, label]) => (
          <TextField key={key} fullWidth size="small" margin="dense"
            label={label} value={s.fields[key]} disabled={s.loading}
            onChange={(e) => s.set(key, e.target.value)}
            inputProps={{ 'data-testid': `profile-${key}` }} />
        ))}
        <TextField fullWidth size="small" margin="dense" multiline
          minRows={3} label="About me" value={s.fields.aboutme}
          disabled={s.loading}
          onChange={(e) => s.set('aboutme', e.target.value)}
          inputProps={{ 'data-testid': 'profile-aboutme' }} />
        <Button type="submit" variant="contained" sx={{ mt: 2 }}
          disabled={s.busy || s.loading} data-testid="profile-save">
          {s.busy ? 'Saving...' : 'Save profile'}
        </Button>
      </Box>
    </Paper>
  )
}
