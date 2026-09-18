'use client'

import { useParams } from 'next/navigation'
import { Container } from '@mui/material'
import GameLibrary from '@/components/launcher/GameLibrary'

export default function GamesPage() {
  const slug = useParams().slug as string
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <GameLibrary slug={slug} />
    </Container>
  )
}
