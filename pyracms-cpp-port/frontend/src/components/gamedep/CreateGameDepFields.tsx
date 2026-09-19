'use client'

import { TextField } from '@mui/material'
import type { useCreateGameDep } from '@/hooks/useCreateGameDep'

/** Name, display name and description inputs of the create form. */
export default function CreateGameDepFields({
  s,
}: {
  s: ReturnType<typeof useCreateGameDep>
}) {
  return (
    <>
      <TextField
        fullWidth
        required
        margin="normal"
        label="Name (URL id)"
        value={s.name}
        onChange={(e) => s.setName(e.target.value)}
        helperText="Letters, digits, dot, dash and underscore"
        inputProps={{ 'data-testid': 'gd-name' }}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Display name"
        value={s.displayName}
        onChange={(e) => s.setDisplayName(e.target.value)}
        inputProps={{ 'data-testid': 'gd-display' }}
      />
      <TextField
        fullWidth
        multiline
        minRows={3}
        margin="normal"
        label="Description"
        value={s.description}
        onChange={(e) => s.setDescription(e.target.value)}
        inputProps={{ 'data-testid': 'gd-description' }}
      />
    </>
  )
}
