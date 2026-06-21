'use client'

import { useParams } from 'next/navigation'
import { useTagCloud } from '@/hooks/useTagCloud'
import { useTenantId } from '@/hooks/useTenantId'

export interface TagCloudViewItem {
  count: number
  fontSize: number
  height: number
  href: string
  name: string
}

function searchHref(slug: string, tag: string) {
  const params = new URLSearchParams({
    site: slug,
    q: tag,
  })
  return `/search?${params.toString()}`
}

export function useTagCloudPage() {
  const params = useParams()
  const slug = params.slug as string
  const { tenantId } = useTenantId(slug)
  const { tags, loading } = useTagCloud(tenantId)
  const maxCount = Math.max(...tags.map((tag) => tag.count), 1)
  const items: TagCloudViewItem[] = tags.map((tag) => {
    const weight = tag.count / maxCount
    return {
      count: tag.count,
      fontSize: 13 + weight * 7,
      height: 32 + weight * 8,
      href: searchHref(slug, tag.name),
      name: tag.name,
    }
  })

  return { items, loading }
}
