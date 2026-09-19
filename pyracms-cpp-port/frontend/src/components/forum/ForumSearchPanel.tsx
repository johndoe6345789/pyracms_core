'use client'

import { useRouter } from 'next/navigation'
import { ForumSearchBar, type ForumSearchResult } from './ForumSearchBar'

interface Props {
  slug: string
  tenantId: number | null
  forums: string[]
}

/** Forum search box whose results open the matching thread. */
export function ForumSearchPanel({ slug, tenantId, forums }: Props) {
  const router = useRouter()
  const open = (r: ForumSearchResult) => {
    if (r.threadId) router.push(`/site/${slug}/forum/thread/${r.threadId}`)
  }
  return (
    <ForumSearchBar tenantId={tenantId} forums={forums}
      onResultClick={open} />
  )
}
