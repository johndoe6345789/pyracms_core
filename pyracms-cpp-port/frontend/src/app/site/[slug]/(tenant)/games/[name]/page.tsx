'use client'

import { useParams } from 'next/navigation'
import { Container } from '@mui/material'
import GameLibrary from '@/components/launcher/GameLibrary'
import CommentSection from '@/components/common/CommentSection'
import { useGameDepItem } from '@/hooks/useGameDepItem'

export default function GameDetailPage() {
  const params = useParams()
  const name = params.name as string
  const { item } = useGameDepItem('game', name)
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <GameLibrary slug={params.slug as string} initialName={name} />
      {item?.id !== undefined && (
        <CommentSection contentType="game" contentId={item.id} />
      )}
    </Container>
  )
}
