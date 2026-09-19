'use client'

import { useParams } from 'next/navigation'
import GameEditor from '@/components/launcher/GameEditor'
import ItemGate from '@/components/gamedep/ItemGate'
import { useGameDepItem } from '@/hooks/useGameDepItem'

export default function EditGamePage() {
  const params = useParams()
  const slug = params.slug as string
  const name = params.name as string
  const { item, loading } = useGameDepItem('game', name)
  return (
    <ItemGate loading={loading} found={!!item}>
      {item && <GameEditor slug={slug} name={name} detail={item} />}
    </ItemGate>
  )
}
