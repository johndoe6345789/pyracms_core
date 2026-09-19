'use client'

import {
  Alert, Box, Button, Container, TextField, Typography,
} from '@mui/material'
import Link from 'next/link'
import { useCreateGameDep } from '@/hooks/useCreateGameDep'
import { GAMEDEP_SECTION } from '@/hooks/useSaveGameDep'
import type { GameDepType } from '@/hooks/useGameDepItem'

interface Props { type: GameDepType; slug: string }

export default function CreateGameDepForm({ type, slug }: Props) {
  const s = useCreateGameDep(type, slug)
  const noun = type === 'game' ? 'game' : 'dependency'
  const back = `/site/${slug}/${GAMEDEP_SECTION[type]}`
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box component="form" onSubmit={s.submit} data-testid="gamedep-create">
        <Typography variant="h3" component="h1" gutterBottom>
          New {noun}
        </Typography>
        {s.error && (
          <Alert severity="error" sx={{ mb: 2 }} data-testid="create-error">
            {s.error}
          </Alert>
        )}
        <TextField fullWidth required margin="normal" label="Name (URL id)"
          value={s.name} onChange={(e) => s.setName(e.target.value)}
          helperText="Letters, digits, dot, dash and underscore"
          inputProps={{ 'data-testid': 'gd-name' }} />
        <TextField fullWidth margin="normal" label="Display name"
          value={s.displayName}
          onChange={(e) => s.setDisplayName(e.target.value)}
          inputProps={{ 'data-testid': 'gd-display' }} />
        <TextField fullWidth multiline minRows={3} margin="normal"
          label="Description" value={s.description}
          onChange={(e) => s.setDescription(e.target.value)}
          inputProps={{ 'data-testid': 'gd-description' }} />
        <Box sx={{
          display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2,
        }}>
          <Button component={Link} href={back}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={s.saving}
            data-testid="gd-submit">
            {s.saving ? 'Creating...' : `Create ${noun}`}
          </Button>
        </Box>
      </Box>
    </Container>
  )
}
