'use client'

import { useParams } from 'next/navigation'
import { Container } from '@mui/material'
import GameLibrary from '@/components/launcher/GameLibrary'

export default function GameDetailPage() {
  const params = useParams()
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <GameLibrary slug={params.slug as string}
        initialName={params.name as string} />
    </Container>
  )
}
