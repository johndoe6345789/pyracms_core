'use client'

import { useParams } from 'next/navigation'
import CreateGameDepForm from '@/components/gamedep/CreateGameDepForm'

export default function NewGamePage() {
  const slug = useParams().slug as string
  return <CreateGameDepForm type="game" slug={slug} />
}
