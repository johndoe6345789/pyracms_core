'use client'

import { useParams } from 'next/navigation'
import { Container } from '@mui/material'
import GameLibrary from '@/components/launcher/GameLibrary'
import CommentSection from '@/components/common/CommentSection'
import { useGameDepItem } from '@/hooks/useGameDepItem'

export default function GameDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const name = params.name as string
  const { item } = useGameDepItem('game', name, slug)
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
      <GameLibrary slug={slug} initialName={name} />
      {item?.id !== undefined && (
        <CommentSection contentType="game" contentId={item.id} />
      )}
    </Container>
  )
}
