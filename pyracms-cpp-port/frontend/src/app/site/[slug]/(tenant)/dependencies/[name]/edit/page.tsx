'use client'

import { useParams } from 'next/navigation'
import DepEditor from '@/components/gamedep/DepEditor'
import ItemGate from '@/components/gamedep/ItemGate'
import { useGameDepItem } from '@/hooks/useGameDepItem'

export default function EditDependencyPage() {
  const params = useParams()
  const slug = params.slug as string
  const name = params.name as string
  const { item, loading } = useGameDepItem('dep', name)
  return (
    <ItemGate loading={loading} found={!!item}>
      {item && <DepEditor slug={slug} name={name} detail={item} />}
    </ItemGate>
  )
}
