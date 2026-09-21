'use client'

import { useParams } from 'next/navigation'
import { Container } from '@mui/material'
import GameLibrary from '@/components/launcher/GameLibrary'

export default function GamesPage() {
  const slug = useParams().slug as string
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
      <GameLibrary slug={slug} />
    </Container>
  )
}
