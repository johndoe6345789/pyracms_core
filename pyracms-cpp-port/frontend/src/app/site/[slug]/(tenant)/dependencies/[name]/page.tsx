'use client'

import { useParams } from 'next/navigation'
import { useGameDepItem } from '@/hooks/useGameDepItem'
import ItemGate from '@/components/gamedep/ItemGate'
import DepView from './DepView'

export default function DependencyDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const name = params.name as string
  const { item, loading } = useGameDepItem('dep', name)
  return (
    <ItemGate loading={loading} found={!!item}>
      {item && <DepView slug={slug} name={name} data={item} />}
    </ItemGate>
  )
}
