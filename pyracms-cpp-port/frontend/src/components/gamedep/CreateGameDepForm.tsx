'use client'

import { Alert, Box, Button, Container, Typography } from '@mui/material'
import Link from 'next/link'
import CreateGameDepFields from './CreateGameDepFields'
import { useCreateGameDep } from '@/hooks/useCreateGameDep'
import { GAMEDEP_SECTION } from '@/hooks/useSaveGameDep'
import type { GameDepType } from '@/hooks/useGameDepItem'

interface Props {
  type: GameDepType
  slug: string
}

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
        <CreateGameDepFields s={s} />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            mt: 2,
          }}
        >
          <Button component={Link} href={back}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={s.saving}
            data-testid="gd-submit"
          >
            {s.saving ? 'Creating...' : `Create ${noun}`}
          </Button>
        </Box>
      </Box>
    </Container>
  )
}
