'use client'

import { useParams } from 'next/navigation'
import CreateGameDepForm from '@/components/gamedep/CreateGameDepForm'

export default function NewDependencyPage() {
  const slug = useParams().slug as string
  return <CreateGameDepForm type="dep" slug={slug} />
}
